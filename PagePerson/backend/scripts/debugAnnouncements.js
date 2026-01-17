/**
 * Announcement query debug script
 * Veritabanındaki duyuruları kontrol eder
 */

import { connectToDatabase, closeDatabaseConnection, getDatabase } from '../config/database.js';

async function debugAnnouncements() {
    try {
        await connectToDatabase();
        const db = getDatabase();

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📢 DUYURULAR DEBUG');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Tüm duyuruları getir
        const allAnnouncements = await db.collection('announcements').find({}).toArray();
        console.log(`Toplam ${allAnnouncements.length} duyuru bulundu\n`);

        allAnnouncements.forEach((ann, index) => {
            console.log(`${index + 1}. ${ann.announcementId} - "${ann.title}"`);
            console.log(`   Status: ${ann.status}`);
            console.log(`   Priority: ${ann.priority}`);
            console.log(`   TargetRoles:`, ann.targetRoles);
            console.log(`   TargetRoles Type:`, Array.isArray(ann.targetRoles) ? 'Array' : typeof ann.targetRoles);
            if (Array.isArray(ann.targetRoles)) {
                console.log(`   TargetRoles Length:`, ann.targetRoles.length);
                console.log(`   TargetRoles Content:`, JSON.stringify(ann.targetRoles));
            }
            console.log(`   CreatedBy: ${ann.createdBy}`);
            console.log(`   CreatedAt: ${ann.createdAt}`);
            console.log(`   ExpiresAt: ${ann.expiresAt}`);
            console.log(`   Expired: ${ann.expiresAt && new Date(ann.expiresAt) < new Date() ? 'YES' : 'NO'}`);
            console.log('');
        });

        // ACTIVE olanları filtrele
        const activeAnnouncements = await db.collection('announcements').find({
            status: 'ACTIVE'
        }).toArray();

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ ACTIVE Duyurular: ${activeAnnouncements.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        activeAnnouncements.forEach(ann => {
            console.log(`- ${ann.announcementId}: ${ann.title}`);
            console.log(`  TargetRoles: ${JSON.stringify(ann.targetRoles)}`);
        });

        // Kullanıcı rollerine göre test et
        const testRoles = ['EMPLOYEE', 'MANAGER', 'HR', 'SYSTEM_ADMIN'];

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🧪 ROL TESTİ');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        for (const role of testRoles) {
            const roleAnnouncements = await db.collection('announcements').find({
                status: 'ACTIVE',
                targetRoles: { $in: [role] },
                $or: [
                    { expiresAt: null },
                    { expiresAt: { $gt: new Date() } }
                ]
            }).toArray();

            console.log(`${role}: ${roleAnnouncements.length} duyuru`);
            roleAnnouncements.forEach(ann => {
                console.log(`  - ${ann.announcementId}: ${ann.title}`);
            });
        }

        await closeDatabaseConnection();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ HATA:', error);
        process.exit(1);
    }
}

debugAnnouncements();
