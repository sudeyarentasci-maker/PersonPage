import express from 'express';
import { Announcement } from '../models/Announcement.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/announcements
 * Yeni duyuru oluştur (HR, ADMIN)
 */
router.post('/', authenticateToken, authorizeRoles('HR', 'SYSTEM_ADMIN'), async (req, res) => {
    try {
        const { title, content, targetRoles, priority, expiresAt } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Başlık ve içerik gereklidir.'
            });
        }

        const announcementData = {
            title,
            content,
            createdBy: req.user.userId,
            targetRoles,
            priority,
            expiresAt
        };

        const newAnnouncement = await Announcement.create(announcementData);

        res.status(201).json({
            success: true,
            message: 'Duyuru oluşturuldu',
            data: newAnnouncement
        });

    } catch (error) {
        console.error('Duyuru oluşturma hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Duyuru oluşturulamadı.'
        });
    }
});

/**
 * GET /api/announcements
 * Duyuruları getir (Kullanıcının rolüne göre)
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userRoles = req.user.roles;

        let announcements = await Announcement.findByUserRoles(userRoles);
        announcements = await Announcement.populateCreatorInfo(announcements);

        res.json({
            success: true,
            data: { announcements }
        });

    } catch (error) {
        console.error('Duyurular getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Duyurular alınamadı.'
        });
    }
});

/**
 * GET /api/announcements/all
 * Tüm duyuruları getir (HR, ADMIN)
 */
router.get('/all', authenticateToken, authorizeRoles('HR', 'SYSTEM_ADMIN'), async (req, res) => {
    try {
        let announcements = await Announcement.findAll();
        announcements = await Announcement.populateCreatorInfo(announcements);

        res.json({
            success: true,
            data: { announcements }
        });

    } catch (error) {
        console.error('Tüm duyurular hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Duyurular alınamadı.'
        });
    }
});

/**
 * GET /api/announcements/:id
 * Duyuru detayı
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const announcement = await Announcement.findByAnnouncementId(id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Duyuru bulunamadı.'
            });
        }

        const [announcementWithCreator] = await Announcement.populateCreatorInfo([announcement]);

        res.json({
            success: true,
            data: announcementWithCreator
        });

    } catch (error) {
        console.error('Duyuru detay hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Duyuru alınamadı.'
        });
    }
});

/**
 * PUT /api/announcements/:id
 * Duyuru güncelle (SADECE HR)
 */
router.put('/:id', authenticateToken, authorizeRoles('HR'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, targetRoles, priority, expiresAt, status } = req.body;

        const updateData = {};
        if (title) updateData.title = title;
        if (content) updateData.content = content;
        if (targetRoles) updateData.targetRoles = targetRoles;
        if (priority) updateData.priority = priority;
        if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
        if (status) updateData.status = status;

        const success = await Announcement.update(id, updateData);

        if (success) {
            res.json({
                success: true,
                message: 'Duyuru güncellendi'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Duyuru güncellenemedi.'
            });
        }

    } catch (error) {
        console.error('Duyuru güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Duyuru güncellenemedi.'
        });
    }
});

/**
 * DELETE /api/announcements/:id
 * Duyuru sil (SADECE HR)
 */
router.delete('/:id', authenticateToken, authorizeRoles('HR'), async (req, res) => {
    try {
        const { id } = req.params;

        const success = await Announcement.delete(id);

        if (success) {
            res.json({
                success: true,
                message: 'Duyuru silindi'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Duyuru silinemedi.'
            });
        }

    } catch (error) {
        console.error('Duyuru silme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Duyuru silinemedi.'
        });
    }
});

export default router;
