import express from 'express';
import { User } from '../models/User.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { generateRandomPassword } from '../utils/passwordGenerator.js';
import { generateUserId } from '../utils/userIdGenerator.js';
import { getDatabase } from '../config/database.js';

const router = express.Router();

/**
 * POST /api/users
 * Yeni kullanıcı oluştur (Sadece HR ve SYSTEM_ADMIN)
 */
router.post('/', authenticateToken, authorizeRoles('HR', 'SYSTEM_ADMIN'), async (req, res) => {
    try {
        const { email, roleNames } = req.body;

        // Validasyon
        if (!email || !roleNames || roleNames.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Email ve en az bir rol gereklidir.'
            });
        }

        // Email benzersizliği kontrolü
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Bu email adresi zaten kullanılıyor.'
            });
        }

        // Rastgele şifre oluştur
        const tempPassword = generateRandomPassword(10);

        // Yeni userId oluştur
        const userId = await generateUserId();

        // Kullanıcı oluştur
        const newUser = {
            userId,
            email,
            passwordHash: await User.hashPassword(tempPassword),
            status: 'ACTIVE',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const db = getDatabase();
        await db.collection('users').insertOne(newUser);

        // Rolleri bul ve user_roles'a ekle
        const roles = await db.collection('roles')
            .find({ name: { $in: roleNames } })
            .toArray();

        if (roles.length !== roleNames.length) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz rol adı.'
            });
        }

        // user_roles koleksiyonuna ekle
        const userRoles = roles.map(role => ({
            userId,
            roleId: role._id
        }));

        await db.collection('user_roles').insertMany(userRoles);

        // Başarılı yanıt
        res.status(201).json({
            success: true,
            message: 'Kullanıcı başarıyla oluşturuldu',
            data: {
                userId,
                email,
                tempPassword, // Sadece oluşturma sırasında göster
                roles: roleNames,
                status: 'ACTIVE'
            }
        });

    } catch (error) {
        console.error('Kullanıcı oluşturma hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı oluşturulamadı.'
        });
    }
});

/**
 * GET /api/users
 * Tüm kullanıcıları listele (Sadece HR ve SYSTEM_ADMIN)
 */
router.get('/', authenticateToken, authorizeRoles('HR', 'SYSTEM_ADMIN'), async (req, res) => {
    try {
        const db = getDatabase();

        // Tüm kullanıcıları al
        const users = await db.collection('users')
            .find({})
            .project({ passwordHash: 0 }) // Şifre hash'ini gösterme
            .toArray();

        // Her kullanıcı için rolleri al
        const usersWithRoles = await Promise.all(users.map(async (user) => {
            const roles = await User.getUserRoles(user.userId);
            return {
                ...user,
                roles: roles.map(r => r.name)
            };
        }));

        res.json({
            success: true,
            data: {
                users: usersWithRoles
            }
        });

    } catch (error) {
        console.error('Kullanıcı listesi hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcılar alınamadı.'
        });
    }
});

/**
 * GET /api/users/:userId
 * Kullanıcı detayı (Sadece HR ve SYSTEM_ADMIN)
 */
router.get('/:userId', authenticateToken, authorizeRoles('HR', 'SYSTEM_ADMIN'), async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByUserId(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı.'
            });
        }

        const roles = await User.getUserRoles(userId);

        res.json({
            success: true,
            data: {
                user: {
                    userId: user.userId,
                    email: user.email,
                    status: user.status,
                    roles: roles.map(r => ({ id: r._id, name: r.name })),
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Kullanıcı detayı hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı bilgisi alınamadı.'
        });
    }
});

/**
 * DELETE /api/users/:userId
 * Kullanıcı sil (Sadece SYSTEM_ADMIN)
 */
router.delete('/:userId', authenticateToken, authorizeRoles('SYSTEM_ADMIN'), async (req, res) => {
    try {
        const { userId } = req.params;

        // Kendini silmeyi engelle
        if (req.user.userId === userId) {
            return res.status(400).json({
                success: false,
                message: 'Kendi hesabınızı silemezsiniz.'
            });
        }

        const db = getDatabase();

        // Kullanıcıyı sil
        const result = await db.collection('users').deleteOne({ userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı.'
            });
        }

        // İlişkili rolleri de sil
        await db.collection('user_roles').deleteMany({ userId });

        res.json({
            success: true,
            message: 'Kullanıcı başarıyla silindi.'
        });

    } catch (error) {
        console.error('Kullanıcı silme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı silinemedi.'
        });
    }
});

export default router;
