import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDatabase } from '../config/database.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Static list of Turkish Holidays (2025-2026 for now, can be extended)
const HOLIDAYS = [
    { name: 'Yılbaşı', date: '2025-01-01', duration: 1 },
    { name: 'Ramazan Bayramı Arefesi', date: '2025-03-29', duration: 0.5 },
    { name: 'Ramazan Bayramı', date: '2025-03-30', duration: 3 },
    { name: '23 Nisan Ulusal Egemenlik ve Çocuk Bayramı', date: '2025-04-23', duration: 1 },
    { name: '1 Mayıs Emek ve Dayanışma Günü', date: '2025-05-01', duration: 1 },
    { name: '19 Mayıs Atatürk\'ü Anma, Gençlik ve Spor Bayramı', date: '2025-05-19', duration: 1 },
    { name: 'Kurban Bayramı Arefesi', date: '2025-06-05', duration: 0.5 },
    { name: 'Kurban Bayramı', date: '2025-06-06', duration: 4 },
    { name: '15 Temmuz Demokrasi ve Milli Birlik Günü', date: '2025-07-15', duration: 1 },
    { name: '30 Ağustos Zafer Bayramı', date: '2025-08-30', duration: 1 },
    { name: '29 Ekim Cumhuriyet Bayramı', date: '2025-10-29', duration: 1.5 },

    // 2026
    { name: 'Yılbaşı', date: '2026-01-01', duration: 1 },
    { name: 'Ramazan Bayramı Arefesi', date: '2026-03-19', duration: 0.5 },
    { name: 'Ramazan Bayramı', date: '2026-03-20', duration: 3 },
    { name: '23 Nisan Ulusal Egemenlik ve Çocuk Bayramı', date: '2026-04-23', duration: 1 },
    { name: '1 Mayıs Emek ve Dayanışma Günü', date: '2026-05-01', duration: 1 },
    { name: '19 Mayıs Atatürk\'ü Anma, Gençlik ve Spor Bayramı', date: '2026-05-19', duration: 1 },
    { name: 'Kurban Bayramı Arefesi', date: '2026-05-26', duration: 0.5 },
    { name: 'Kurban Bayramı', date: '2026-05-27', duration: 4 },
    { name: '15 Temmuz Demokrasi ve Milli Birlik Günü', date: '2026-07-15', duration: 1 },
    { name: '30 Ağustos Zafer Bayramı', date: '2026-08-30', duration: 1 },
    { name: '29 Ekim Cumhuriyet Bayramı', date: '2026-10-29', duration: 1.5 },
];

/**
 * GET /api/dashboard/widgets
 * Returns data for Birthdays, Leaves, Holidays
 */
router.get('/widgets', authenticateToken, async (req, res) => {
    try {
        const db = getDatabase();
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 14); // Look ahead 2 weeks for birthdays, 1 week for leaves

        // 1. Upcoming Birthdays (All active users)
        const users = await db.collection('users').find({ status: 'ACTIVE' }).toArray();
        const birthdays = users
            .filter(u => u.birthDate)
            .map(u => {
                const birthDate = new Date(u.birthDate);
                const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
                if (nextBirthday < today) {
                    nextBirthday.setFullYear(today.getFullYear() + 1);
                }
                const diffTime = nextBirthday - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return {
                    userId: u.userId,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    photo: u.profilePicture || null,
                    date: birthDate,
                    nextDate: nextBirthday,
                    daysLeft: diffDays
                };
            })
            .sort((a, b) => a.daysLeft - b.daysLeft)
            .filter(b => b.daysLeft <= 60) // Show birthdays in next 60 days to fill the list, or restrict if many
            .slice(0, 5);

        // 2. Upcoming Leaves (Next 7 days)
        const leaves = await db.collection('leaves').aggregate([
            {
                $match: {
                    startDate: { $gte: today.toISOString(), $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() },
                    status: 'APPROVED'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'user'
                }
            },
            { $unwind: '$user' }
        ]).toArray();

        // 3. Next Holiday
        const futureHolidays = HOLIDAYS
            .map(h => ({ ...h, dateObj: new Date(h.date) }))
            .filter(h => h.dateObj >= today)
            .sort((a, b) => a.dateObj - b.dateObj);

        const nextHoliday = futureHolidays[0] || null;

        res.json({
            success: true,
            data: {
                birthdays,
                leaves: leaves.map(l => ({
                    userId: l.userId,
                    name: `${l.user.firstName} ${l.user.lastName}`,
                    photo: l.user.profilePicture,
                    startDate: l.startDate,
                    days: Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1
                })),
                nextHoliday
            }
        });
    } catch (error) {
        console.error('Widget error:', error);
        res.status(500).json({ success: false, message: 'Widget data error' });
    }
});

export default router;
