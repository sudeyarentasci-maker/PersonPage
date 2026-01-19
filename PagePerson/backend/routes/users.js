import express from 'express';
import { User } from '../models/User.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { generateRandomPassword } from '../utils/passwordGenerator.js';
import { generateUserId } from '../utils/userIdGenerator.js';
import { getDatabase } from '../config/database.js';
import { logUserAction } from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/users
 * Yeni kullanıcı oluştur (SADECE HR)
 */
router.post('/', authenticateToken, authorizeRoles('HR'), async (req, res) => {
    try {
        const { email, roleNames, firstName, lastName, manager, startDate, birthDate, title, address, phoneNumber } = req.body;

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
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(manager && { manager }),
            ...(startDate && { startDate: new Date(startDate) }),
            ...(birthDate && { birthDate: new Date(birthDate) }),
            ...(title && { title }),
            ...(address && { address }),
            ...(phoneNumber && { phoneNumber }),
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

        // If manager is assigned, create employee_manager relationship
        if (manager) {
            await db.collection('employee_manager').insertOne({
                employeeId: userId,
                managerId: manager,
                assignedAt: new Date()
            });
        }

        // Kullanıcı oluşturma log kaydı
        await logUserAction(
            'Yeni kullanıcı oluşturuldu',
            {
                userId: req.user.userId,
                userName: req.user.email,
                userEmail: req.user.email
            },
            { email },
            `Kullanıcı: ${email}, Roller: ${roleNames.join(', ')}`
        );

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
 * GET /api/users/me
 * Kendi profil bilgilerini getir (Tüm authenticated kullanıcılar)
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findByUserId(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı.'
            });
        }

        const roles = await User.getUserRoles(userId);
        const primaryRole = await User.getPrimaryRole(userId);

        // Get manager info from employee_manager collection
        const db = getDatabase();
        const managerRelation = await db.collection('employee_manager')
            .findOne({ employeeId: userId });

        let managerInfo = null;
        if (managerRelation) {
            const managerUser = await User.findByUserId(managerRelation.managerId);
            if (managerUser) {
                managerInfo = {
                    userId: managerUser.userId,
                    email: managerUser.email,
                    firstName: managerUser.firstName,
                    lastName: managerUser.lastName
                };
            }
        }

        res.json({
            success: true,
            data: {
                user: {
                    userId: user.userId,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    status: user.status,
                    primaryRole: primaryRole?.name,
                    manager: user.manager,
                    managerInfo: managerInfo,
                    startDate: user.startDate,
                    title: user.title,
                    address: user.address,
                    phoneNumber: user.phoneNumber,
                    roles: roles.map(r => ({ id: r._id, name: r.name })),
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Profil bilgisi hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Profil bilgisi alınamadı.'
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
                    firstName: user.firstName,
                    lastName: user.lastName,
                    status: user.status,
                    manager: user.manager,
                    startDate: user.startDate,
                    title: user.title,
                    address: user.address,
                    phoneNumber: user.phoneNumber,
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
 * PUT /api/users/me/password
 * Kullanıcı kendi şifresini değiştirir (requires current password)
 */
router.put('/me/password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        // Validasyon
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mevcut şifre ve yeni şifre gereklidir.'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Yeni şifre en az 6 karakter olmalıdır.'
            });
        }

        // Kullanıcıyı bul
        const user = await User.findByUserId(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı.'
            });
        }

        // Mevcut şifreyi doğrula
        const isPasswordValid = await User.comparePassword(currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Mevcut şifre yanlış.'
            });
        }

        // Yeni şifreyi hash'le ve güncelle
        const newPasswordHash = await User.hashPassword(newPassword);
        await User.updateByUserId(userId, { passwordHash: newPasswordHash });

        // Şifre değişikliği log kaydı
        await logUserAction(
            'Kullanıcı şifresini değiştirdi',
            {
                userId: req.user.userId,
                userName: req.user.email,
                userEmail: req.user.email
            },
            { email: req.user.email },
            'Kendi şifresini güncelledi'
        );

        res.json({
            success: true,
            message: 'Şifre başarıyla değiştirildi.'
        });

    } catch (error) {
        console.error('Şifre değiştirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Şifre değiştirilemedi.'
        });
    }
});


/**
 * PUT /api/users/:userId/email
 * Kullanıcının email'ini değiştir (SADECE HR)
 */
router.put('/:userId/email', authenticateToken, authorizeRoles('HR'), async (req, res) => {
    try {
        const { userId } = req.params;
        const { newEmail } = req.body;

        if (!newEmail || !newEmail.includes('@')) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli bir email adresi giriniz.'
            });
        }

        const db = getDatabase();

        // Email benzersizliği kontrolü
        const existingUser = await db.collection('users').findOne({ email: newEmail });
        if (existingUser && existingUser.userId !== userId) {
            return res.status(409).json({
                success: false,
                message: 'Bu email adresi zaten kullanılıyor.'
            });
        }

        // Email güncelle
        const oldUser = await db.collection('users').findOne({ userId });
        const result = await db.collection('users').updateOne(
            { userId },
            {
                $set: {
                    email: newEmail,
                    updatedAt: new Date()
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı.'
            });
        }

        // Email değişikliği log kaydı
        await logUserAction(
            'Kullanıcı email adresi değiştirildi',
            {
                userId: req.user.userId,
                userName: req.user.email,
                userEmail: req.user.email
            },
            { email: oldUser.email },
            `Eski: ${oldUser.email} → Yeni: ${newEmail}`
        );

        res.json({
            success: true,
            message: 'Email başarıyla güncellendi.'
        });

    } catch (error) {
        console.error('Email güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Email güncellenemedi.'
        });
    }
});

/**
 * PUT /api/users/:userId/password
 * Kullanıcının şifresini değiştir (SADECE HR)
 */
router.put('/:userId/password', authenticateToken, authorizeRoles('HR'), async (req, res) => {
    try {
        const { userId } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Şifre en az 6 karakter olmalıdır.'
            });
        }

        // Şifreyi hash'le
        const passwordHash = await User.hashPassword(newPassword);

        const db = getDatabase();
        const targetUser = await db.collection('users').findOne({ userId });
        const result = await db.collection('users').updateOne(
            { userId },
            {
                $set: {
                    passwordHash,
                    updatedAt: new Date()
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı.'
            });
        }

        // Admin tarafından şifre değişikliği log kaydı
        await logUserAction(
            'Kullanıcı şifresi değiştirildi (Admin)',
            {
                userId: req.user.userId,
                userName: req.user.email,
                userEmail: req.user.email
            },
            { email: targetUser.email },
            `Admin tarafından şifre sıfırlandı: ${targetUser.email}`
        );

        res.json({
            success: true,
            message: 'Şifre başarıyla güncellendi.'
        });

    } catch (error) {
        console.error('Şifre güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Şifre güncellenemedi.'
        });
    }
});

/**
 * PUT /api/users/:userId/roles
 * Kullanıcının rollerini değiştir (SADECE HR)
 */
router.put('/:userId/roles', authenticateToken, authorizeRoles('HR'), async (req, res) => {
    try {
        const { userId } = req.params;
        const { roleNames } = req.body;

        if (!roleNames || !Array.isArray(roleNames) || roleNames.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'En az bir rol seçilmelidir.'
            });
        }

        const db = getDatabase();

        // Rolleri bul
        const roles = await db.collection('roles')
            .find({ name: { $in: roleNames } })
            .toArray();

        if (roles.length !== roleNames.length) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz rol adı.'
            });
        }

        // Önce mevcut rolleri sil
        await db.collection('user_roles').deleteMany({ userId });

        // Yeni rolleri ekle
        const userRoles = roles.map(role => ({
            userId,
            roleId: role._id
        }));

        await db.collection('user_roles').insertMany(userRoles);

        // Rol değişikliği log kaydı
        await logUserAction(
            'Kullanıcı rolleri güncellendi',
            {
                userId: req.user.userId,
                userName: req.user.email,
                userEmail: req.user.email
            },
            { email: 'N/A' },
            `Kullanıcı ID: ${userId}, Yeni roller: ${roleNames.join(', ')}`
        );

        res.json({
            success: true,
            message: 'Roller başarıyla güncellendi.',
            data: { roleNames }
        });

    } catch (error) {
        console.error('Rol güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Roller güncellenemedi.'
        });
    }
});

/**
 * PUT /api/users/:userId/status
 * Kullanıcı durumunu değiştir (active/inactive) (SADECE HR)
 */
router.put('/:userId/status', authenticateToken, authorizeRoles('HR'), async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        if (!['ACTIVE', 'INACTIVE'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz durum değeri. (ACTIVE veya INACTIVE)'
            });
        }

        const db = getDatabase();
        const targetUser = await db.collection('users').findOne({ userId });
        const result = await db.collection('users').updateOne(
            { userId },
            {
                $set: {
                    status,
                    updatedAt: new Date()
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı.'
            });
        }

        // Durum değişikliği log kaydı
        await logUserAction(
            `Kullanıcı durumu değiştirildi: ${status}`,
            {
                userId: req.user.userId,
                userName: req.user.email,
                userEmail: req.user.email
            },
            { email: targetUser.email },
            `${targetUser.email} - ${status === 'ACTIVE' ? 'Aktif' : 'Pasif'} yapıldı`
        );

        res.json({
            success: true,
            message: `Kullanıcı ${status === 'ACTIVE' ? 'aktif edildi' : 'deaktive edildi'}.`
        });

    } catch (error) {
        console.error('Durum güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Durum güncellenemedi.'
        });
    }
});

/**
 * DELETE /api/users/:userId
 * Kullanıcıyı tamamen sil (SADECE HR)
 * CASCADE DELETE: Kullanıcıya ait tüm veriler silinir
 */
router.delete('/:userId', authenticateToken, authorizeRoles('HR'), async (req, res) => {
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

        // Kullanıcı var mı kontrol et
        const user = await db.collection('users').findOne({ userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı.'
            });
        }

        // CASCADE DELETE - Kullanıcıya ait tüm verileri sil
        console.log(`🗑️ CASCADE DELETE başlatıldı: ${userId} (${user.email})`);

        // 1. user_roles - Kullanıcının rol ilişkileri
        const rolesResult = await db.collection('user_roles').deleteMany({ userId });
        console.log(`  ✓ Silindi ${rolesResult.deletedCount} rol ilişkisi`);

        // 2. employee_manager - Hem employee hem manager olarak ilişkiler
        const managerResult = await db.collection('employee_manager').deleteMany({
            $or: [
                { employeeId: userId },
                { managerId: userId }
            ]
        });
        console.log(`  ✓ Silindi ${managerResult.deletedCount} yönetici ilişkisi`);

        // 3. leave_requests - Kullanıcının tüm izin talepleri
        const leavesResult = await db.collection('leave_requests').deleteMany({ userId });
        console.log(`  ✓ Silindi ${leavesResult.deletedCount} izin talebi`);

        // 4. announcements - Kullanıcının oluşturduğu duyurular
        const announcementsResult = await db.collection('announcements').deleteMany({ createdBy: userId });
        console.log(`  ✓ Silindi ${announcementsResult.deletedCount} duyuru`);

        // 5. tasks - Kullanıcıya atanan veya oluşturduğu görevler
        const tasksResult = await db.collection('tasks').deleteMany({
            $or: [
                { createdBy: userId },
                { assignees: userId }
            ]
        });
        console.log(`  ✓ Silindi ${tasksResult.deletedCount} görev`);

        // 6. logs - Kullanıcıya ait tüm sistem logları
        const logsResult = await db.collection('logs').deleteMany({ userId });
        console.log(`  ✓ Silindi ${logsResult.deletedCount} log kaydı`);

        // 7. users - Kullanıcının kendisi
        await db.collection('users').deleteOne({ userId });
        console.log(`  ✓ Kullanıcı kaydı silindi`);

        console.log(`✅ CASCADE DELETE tamamlandı: ${userId}`);

        // Kullanıcı silme log kaydı
        await logUserAction(
            'Kullanıcı silindi',
            {
                userId: req.user.userId,
                userName: req.user.email,
                userEmail: req.user.email
            },
            { email: user.email },
            `${user.email} - Silinen veriler: ${leavesResult.deletedCount} izin, ${announcementsResult.deletedCount} duyuru, ${tasksResult.deletedCount} görev, ${logsResult.deletedCount} log`
        );

        res.json({
            success: true,
            message: 'Kullanıcı ve tüm ilişkili verileri kalıcı olarak silindi.',
            data: {
                userId,
                email: user.email,
                deletedRelations: {
                    roles: rolesResult.deletedCount,
                    managerRelations: managerResult.deletedCount,
                    leaves: leavesResult.deletedCount,
                    announcements: announcementsResult.deletedCount,
                    tasks: tasksResult.deletedCount,
                    logs: logsResult.deletedCount
                }
            }
        });

    } catch (error) {
        console.error('Kullanıcıyı silme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı silinemedi.'
        });
    }
});

export default router;
