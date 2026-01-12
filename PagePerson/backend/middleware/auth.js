import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

/**
 * JWT token doğrulama middleware
 */
export function authenticateToken(req, res, next) {
    // Authorization header'ından token al
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Erişim reddedildi. Token bulunamadı.'
        });
    }

    try {
        // Token'ı doğrula
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Kullanıcı bilgilerini request'e ekle
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Geçersiz veya süresi dolmuş token.'
        });
    }
}

/**
 * Rol bazlı yetkilendirme middleware
 * @param {string[]} allowedRoles - İzin verilen roller
 */
export function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                success: false,
                message: 'Yetkiniz yok.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Bu işlem için ${allowedRoles.join(' veya ')} rolü gerekli.`
            });
        }

        next();
    };
}

/**
 * JWT token oluşturur
 */
export function generateToken(payload, expiresIn = '24h') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}
