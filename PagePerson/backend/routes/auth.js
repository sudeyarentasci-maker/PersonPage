import express from 'express';
import { User } from '../models/User.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Kullanıcı girişi
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validasyon
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email ve şifre gereklidir.'
            });
        }

        // Kullanıcıyı bul
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Böyle bir kullanıcı yok.'
            });
        }

        // Kullanıcı aktif mi kontrol et
        if (user.status !== 'ACTIVE') {
            return res.status(403).json({
                success: false,
                message: 'Hesabınız aktif değil. Lütfen yöneticinizle iletişime geçin.'
            });
        }

        // Şifre kontrolü
        // NOT: İlk kurulumda passwordHash yoksa, geçici çözüm olarak şifreyi kontrol etmiyoruz
        if (user.passwordHash) {
            const isPasswordValid = await User.comparePassword(password, user.passwordHash);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Şifreniz hatalı.'
                });
            }
        } else {
            // GEÇICI: Veritabanında passwordHash yoksa, demo için kabul ediyoruz
            console.warn(`⚠️ UYARI: ${email} için passwordHash bulunamadı. Demo modu aktif.`);
        }

        // Kullanıcının rollerini al
        const roles = await User.getUserRoles(user.userId);
        const primaryRole = await User.getPrimaryRole(user.userId);

        if (!primaryRole) {
            return res.status(403).json({
                success: false,
                message: 'Kullanıcıya atanmış bir rol bulunamadı.'
            });
        }

        // JWT token oluştur
        const token = generateToken({
            userId: user.userId,
            email: user.email,
            role: primaryRole.name,
            roles: roles.map(r => r.name)
        });

        // Son giriş zamanını güncelle
        await User.updateByUserId(user.userId, { lastLogin: new Date() });

        // Başarılı yanıt
        res.json({
            success: true,
            message: 'Giriş başarılı',
            data: {
                token,
                user: {
                    userId: user.userId,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    status: user.status,
                    primaryRole: primaryRole.name,
                    roles: roles.map(r => ({
                        id: r._id,
                        name: r.name,
                        description: r.description
                    }))
                }
            }
        });

    } catch (error) {
        console.error('Login hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.'
        });
    }
});

/**
 * GET /api/auth/me
 * Mevcut kullanıcı bilgilerini getirir (Token gerekli)
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByUserId(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı.'
            });
        }

        const roles = await User.getUserRoles(user.userId);
        const primaryRole = await User.getPrimaryRole(user.userId);

        res.json({
            success: true,
            data: {
                user: {
                    userId: user.userId,
                    email: user.email,
                    status: user.status,
                    primaryRole: primaryRole?.name,
                    roles: roles.map(r => ({
                        id: r._id,
                        name: r.name,
                        description: r.description
                    }))
                }
            }
        });

    } catch (error) {
        console.error('Kullanıcı bilgisi hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı bilgileri alınamadı.'
        });
    }
});

/**
 * POST /api/auth/logout
 * Kullanıcı çıkışı (Frontend'de token silinir, backend'de log tutulabilir)
 */
router.post('/logout', authenticateToken, (req, res) => {
    // Token zaten client-side'da silinecek
    // İsteğe bağlı olarak logout log'u tutulabilir
    res.json({
        success: true,
        message: 'Çıkış başarılı'
    });
});

export default router;
