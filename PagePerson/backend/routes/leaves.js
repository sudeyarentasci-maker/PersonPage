import express from 'express';
import { Leave } from '../models/Leave.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { getDatabase } from '../config/database.js';

const router = express.Router();

/**
 * POST /api/leaves
 * Yeni izin talebi oluştur (Herkes kendi için)
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, leaveType, reason } = req.body;

        // Validasyon
        if (!startDate || !endDate || !leaveType || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Tüm alanlar gereklidir.'
            });
        }

        // Tarih kontrolü
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            return res.status(400).json({
                success: false,
                message: 'Başlangıç tarihi bitiş tarihinden sonra olamaz.'
            });
        }

        // Kullanıcının manager'ını bul
        const db = getDatabase();
        const empManager = await db.collection('employee_manager')
            .findOne({ employeeId: req.user.userId });

        const leaveData = {
            userId: req.user.userId,
            startDate,
            endDate,
            leaveType,
            reason,
            managerId: empManager?.managerId || null
        };

        const newLeave = await Leave.create(leaveData);

        res.status(201).json({
            success: true,
            message: 'İzin talebi oluşturuldu',
            data: newLeave
        });

    } catch (error) {
        console.error('İzin oluşturma hatası:', error);
        res.status(500).json({
            success: false,
            message: 'İzin talebi oluşturulamadı.'
        });
    }
});

/**
 * GET /api/leaves/my
 * Kendi izinlerimi getir (Herkes)
 */
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const leaves = await Leave.findByUserId(req.user.userId);

        // Kullanıcı bilgileriyle birleştir
        const db = getDatabase();
        const leavesWithDetails = await Promise.all(leaves.map(async (leave) => {
            const user = await db.collection('users').findOne(
                { userId: leave.userId },
                { projection: { email: 1, userId: 1 } }
            );

            return {
                ...leave,
                userName: user?.email || 'Unknown'
            };
        }));

        res.json({
            success: true,
            data: { leaves: leavesWithDetails }
        });

    } catch (error) {
        console.error('İzinleri getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'İzinler alınamadı.'
        });
    }
});

/**
 * GET /api/leaves/team
 * Ekip izinlerini getir (MANAGER)
 */
router.get('/team', authenticateToken, authorizeRoles('MANAGER', 'HR', 'SYSTEM_ADMIN'), async (req, res) => {
    try {
        const leaves = await Leave.findByManagerId(req.user.userId);

        // Kullanıcı bilgileriyle birleştir
        const db = getDatabase();
        const leavesWithDetails = await Promise.all(leaves.map(async (leave) => {
            const user = await db.collection('users').findOne(
                { userId: leave.userId },
                { projection: { email: 1, userId: 1 } }
            );

            return {
                ...leave,
                userName: user?.email || 'Unknown'
            };
        }));

        res.json({
            success: true,
            data: { leaves: leavesWithDetails }
        });

    } catch (error) {
        console.error('Ekip izinleri hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Ekip izinleri alınamadı.'
        });
    }
});

/**
 * GET /api/leaves/pending
 * Onay bekleyen izinler
 */
router.get('/pending', authenticateToken, authorizeRoles('MANAGER', 'HR', 'SYSTEM_ADMIN'), async (req, res) => {
    try {
        let leaves;

        // HR veya ADMIN ise tümünü göster
        const isHRorAdmin = req.user.roles.some(r => ['HR', 'SYSTEM_ADMIN'].includes(r));

        if (isHRorAdmin) {
            leaves = await Leave.findPending(); // Tümü
        } else {
            leaves = await Leave.findPending(req.user.userId); // Sadece ekibi
        }

        // Kullanıcı bilgileriyle birleştir
        const db = getDatabase();
        const leavesWithDetails = await Promise.all(leaves.map(async (leave) => {
            const user = await db.collection('users').findOne(
                { userId: leave.userId },
                { projection: { email: 1, userId: 1 } }
            );

            return {
                ...leave,
                userName: user?.email || 'Unknown'
            };
        }));

        res.json({
            success: true,
            data: { leaves: leavesWithDetails }
        });

    } catch (error) {
        console.error('Pending izinler hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Bekleyen izinler alınamadı.'
        });
    }
});

/**
 * GET /api/leaves/all
 * Tüm izinler (HR, ADMIN)
 */
router.get('/all', authenticateToken, authorizeRoles('HR', 'SYSTEM_ADMIN'), async (req, res) => {
    try {
        const { status, leaveType } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (leaveType) filters.leaveType = leaveType;

        const leaves = await Leave.findAll(filters);

        // Kullanıcı bilgileriyle birleştir
        const db = getDatabase();
        const leavesWithDetails = await Promise.all(leaves.map(async (leave) => {
            const user = await db.collection('users').findOne(
                { userId: leave.userId },
                { projection: { email: 1, userId: 1 } }
            );

            return {
                ...leave,
                userName: user?.email || 'Unknown'
            };
        }));

        res.json({
            success: true,
            data: { leaves: leavesWithDetails }
        });

    } catch (error) {
        console.error('Tüm izinler hatası:', error);
        res.status(500).json({
            success: false,
            message: 'İzinler alınamadı.'
        });
    }
});

/**
 * PUT /api/leaves/:id/approve
 * İzin onayla (MANAGER, HR, ADMIN)
 */
router.put('/:id/approve', authenticateToken, authorizeRoles('MANAGER', 'HR', 'SYSTEM_ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;

        const leave = await Leave.findByLeaveId(id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'İzin talebi bulunamadı.'
            });
        }

        // Manager ise sadece kendi ekibinin izinlerini onaylayabilir
        const isHRorAdmin = req.user.roles.some(r => ['HR', 'SYSTEM_ADMIN'].includes(r));

        if (!isHRorAdmin) {
            // Manager mı kontrol et
            const db = getDatabase();
            const isManager = await db.collection('employee_manager').findOne({
                employeeId: leave.userId,
                managerId: req.user.userId
            });

            if (!isManager) {
                return res.status(403).json({
                    success: false,
                    message: 'Bu izni onaylamaya yetkiniz yok.'
                });
            }
        }

        const success = await Leave.approve(id, req.user.userId, comment || '');

        if (success) {
            res.json({
                success: true,
                message: 'İzin onaylandı'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'İzin onaylanamadı.'
            });
        }

    } catch (error) {
        console.error('İzin onaylama hatası:', error);
        res.status(500).json({
            success: false,
            message: 'İzin onaylanamadı.'
        });
    }
});

/**
 * PUT /api/leaves/:id/reject
 * İzin reddet (MANAGER, HR, ADMIN)
 */
router.put('/:id/reject', authenticateToken, authorizeRoles('MANAGER', 'HR', 'SYSTEM_ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;

        const leave = await Leave.findByLeaveId(id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'İzin talebi bulunamadı.'
            });
        }

        // Manager ise sadece kendi ekibinin izinlerini reddedebilir
        const isHRorAdmin = req.user.roles.some(r => ['HR', 'SYSTEM_ADMIN'].includes(r));

        if (!isHRorAdmin) {
            const db = getDatabase();
            const isManager = await db.collection('employee_manager').findOne({
                employeeId: leave.userId,
                managerId: req.user.userId
            });

            if (!isManager) {
                return res.status(403).json({
                    success: false,
                    message: 'Bu izni reddetmeye yetkiniz yok.'
                });
            }
        }

        const success = await Leave.reject(id, req.user.userId, comment || '');

        if (success) {
            res.json({
                success: true,
                message: 'İzin reddedildi'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'İzin reddedilemedi.'
            });
        }

    } catch (error) {
        console.error('İzin reddetme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'İzin reddedilemedi.'
        });
    }
});

/**
 * GET /api/leaves/stats
 * Kullanıcının izin istatistikleri
 */
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const usedDays = await Leave.getTotalLeaveDays(req.user.userId, currentYear);
        const annualLeaveLimit = 20; // Yıllık izin hakkı (ayarlanabilir)

        res.json({
            success: true,
            data: {
                year: currentYear,
                annualLeaveLimit,
                usedDays,
                remainingDays: annualLeaveLimit - usedDays
            }
        });

    } catch (error) {
        console.error('İstatistik hatası:', error);
        res.status(500).json({
            success: false,
            message: 'İstatistikler alınamadı.'
        });
    }
});

export default router;
