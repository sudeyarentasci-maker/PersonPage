import express from 'express';
import { SystemSettings } from '../models/SystemSettings.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/system-settings
 * Sistem ayarlarını getir (Sadece ADMIN)
 */
router.get('/', authenticateToken, authorizeRoles('SYSTEM_ADMIN'), async (req, res) => {
    try {
        const settings = await SystemSettings.getSettings();

        // Hassas bilgileri (şifreler) döndürme
        if (settings.email) {
            settings.email.smtpPassword = settings.email.smtpPassword ? '********' : '';
        }

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Ayarlar getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Ayarlar alınamadı'
        });
    }
});

/**
 * PUT /api/system-settings
 * Tüm ayarları güncelle (Sadece ADMIN)
 */
router.put('/', authenticateToken, authorizeRoles('SYSTEM_ADMIN'), async (req, res) => {
    try {
        const userId = req.user.userId;
        const updates = req.body;

        const success = await SystemSettings.updateSettings(updates, userId);

        if (success) {
            res.json({
                success: true,
                message: 'Ayarlar güncellendi'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Ayarlar güncellenemedi'
            });
        }
    } catch (error) {
        console.error('Ayarları güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Ayarlar güncellenemedi'
        });
    }
});

/**
 * PUT /api/system-settings/:category
 * Belirli kategoriyi güncelle (Sadece ADMIN)
 */
router.put('/:category', authenticateToken, authorizeRoles('SYSTEM_ADMIN'), async (req, res) => {
    try {
        const { category } = req.params;
        const userId = req.user.userId;
        const data = req.body;

        const validCategories = ['general', 'email', 'security', 'backup'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz kategori'
            });
        }

        const success = await SystemSettings.updateCategory(category, data, userId);

        if (success) {
            res.json({
                success: true,
                message: `${category} ayarları güncellendi`
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Ayarlar güncellenemedi'
            });
        }
    } catch (error) {
        console.error('Kategori güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Ayarlar güncellenemedi'
        });
    }
});

/**
 * POST /api/system-settings/test-email
 * Email ayarlarını test et (Sadece ADMIN)
 */
router.post('/test-email', authenticateToken, authorizeRoles('SYSTEM_ADMIN'), async (req, res) => {
    try {
        const emailConfig = req.body;
        const result = await SystemSettings.testEmailSettings(emailConfig);

        res.json(result);
    } catch (error) {
        console.error('Email test hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Email testi yapılamadı'
        });
    }
});

export default router;
