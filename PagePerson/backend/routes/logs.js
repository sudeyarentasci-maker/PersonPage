import express from 'express';
import { Log } from '../models/Log.js';

const router = express.Router();

// Logları getir (filtreleme ile)
router.get('/', async (req, res) => {
    try {
        const { type, startDate, endDate, search, limit } = req.query;

        const filters = {
            type,
            startDate,
            endDate,
            search,
            limit: limit ? parseInt(limit) : 100
        };

        const result = await Log.getAll(filters);

        if (result.success) {
            res.json({
                success: true,
                data: {
                    logs: result.logs,
                    total: result.total
                }
            });
        } else {
            throw result.error;
        }

    } catch (error) {
        console.error('Log getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Loglar getirilirken bir hata oluştu'
        });
    }
});

// Tüm logları sil (SADECE SYSTEM_ADMIN)
router.delete('/all', async (req, res) => {
    try {
        const db = await import('../config/database.js').then(m => m.getDatabase());
        const result = await db.collection('logs').deleteMany({});

        console.log(`🗑️ Tüm loglar silindi: ${result.deletedCount} kayıt`);

        res.json({
            success: true,
            message: `${result.deletedCount} log kaydı silindi`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Tüm logları silme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Loglar silinemedi'
        });
    }
});

// Seçili logları sil (SADECE SYSTEM_ADMIN)
router.delete('/', async (req, res) => {
    try {
        const { logIds } = req.body;

        if (!logIds || !Array.isArray(logIds) || logIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Log ID listesi gerekli'
            });
        }

        const { ObjectId } = await import('mongodb');
        const db = await import('../config/database.js').then(m => m.getDatabase());

        const objectIds = logIds.map(id => new ObjectId(id));
        const result = await db.collection('logs').deleteMany({
            _id: { $in: objectIds }
        });

        console.log(`🗑️ ${result.deletedCount} log silindi`);

        res.json({
            success: true,
            message: `${result.deletedCount} log kaydı silindi`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Seçili logları silme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Loglar silinemedi'
        });
    }
});

// Yetim verileri temizle (orphaned leaves & logs) (SADECE SYSTEM_ADMIN)
router.post('/cleanup-orphaned', async (req, res) => {
    try {
        const db = await import('../config/database.js').then(m => m.getDatabase());

        console.log('🧹 Yetim veri temizliği başlatılıyor...');

        // Tüm kullanıcı ID'lerini al
        const users = await db.collection('users').find({}, { projection: { userId: 1, email: 1 } }).toArray();
        const validUserIds = users.map(u => u.userId);

        console.log(`✓ ${validUserIds.length} aktif kullanıcı bulundu:`);
        console.log('Valid User IDs:', validUserIds);

        // Tüm izinleri al ve kontrol et
        const allLeaves = await db.collection('leave_requests').find({}).toArray();
        console.log(`📋 Toplam ${allLeaves.length} izin kaydı bulundu`);

        // Yetim izinleri bul
        const orphanedLeaves = allLeaves.filter(leave => !validUserIds.includes(leave.userId));
        console.log(`⚠️  ${orphanedLeaves.length} yetim izin bulundu:`);
        orphanedLeaves.forEach(leave => {
            console.log(`  - userId: ${leave.userId}, leaveId: ${leave.leaveId}, dates: ${leave.startDate} - ${leave.endDate}`);
        });

        // Geçersiz userId'ye sahip izinleri sil
        const leavesResult = await db.collection('leave_requests').deleteMany({
            userId: { $nin: validUserIds }
        });
        console.log(`🗑️  ${leavesResult.deletedCount} yetim izin silindi`);

        // Geçersiz userId'ye sahip logları sil (sistem loglarını hariç tut)
        const logsResult = await db.collection('logs').deleteMany({
            userId: { $nin: validUserIds, $ne: 'system' }
        });
        console.log(`🗑️  ${logsResult.deletedCount} yetim log silindi`);

        // Announcements temizle
        const announcementsResult = await db.collection('announcements').deleteMany({
            createdBy: { $nin: validUserIds }
        });
        console.log(`🗑️  ${announcementsResult.deletedCount} yetim duyuru silindi`);

        // Tasks temizle
        const tasksResult = await db.collection('tasks').deleteMany({
            $or: [
                { createdBy: { $nin: validUserIds } },
                { assignees: { $elemMatch: { $nin: validUserIds } } }
            ]
        });
        console.log(`🗑️  ${tasksResult.deletedCount} yetim görev silindi`);

        const totalDeleted = leavesResult.deletedCount + logsResult.deletedCount + announcementsResult.deletedCount + tasksResult.deletedCount;
        console.log(`✅ Yetim veri temizliği tamamlandı! Toplam ${totalDeleted} kayıt silindi.`);

        res.json({
            success: true,
            message: `Temizlik tamamlandı: Toplam ${totalDeleted} kayıt silindi`,
            data: {
                deletedLeaves: leavesResult.deletedCount,
                deletedLogs: logsResult.deletedCount,
                deletedAnnouncements: announcementsResult.deletedCount,
                deletedTasks: tasksResult.deletedCount,
                totalDeleted,
                totalUsers: validUserIds.length,
                orphanedLeavesFound: orphanedLeaves.length
            }
        });
    } catch (error) {
        console.error('❌ Yetim veri temizleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Temizlik yapılamadı',
            error: error.message
        });
    }
});

export default router;
