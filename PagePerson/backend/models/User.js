import bcrypt from 'bcrypt';
import { getDatabase } from '../config/database.js';

const SALT_ROUNDS = 10;

/**
 * Kullanıcı modeli - MongoDB işlemleri
 */
export class User {

    /**
     * Email ile kullanıcı bulur
     */
    static async findByEmail(email) {
        const db = getDatabase();
        const user = await db.collection('users').findOne({ email });
        return user;
    }

    /**
     * UserId ile kullanıcı bulur
     */
    static async findByUserId(userId) {
        const db = getDatabase();
        const user = await db.collection('users').findOne({ userId });
        return user;
    }

    /**
     * Kullanıcının tüm rollerini getirir
     */
    static async getUserRoles(userId) {
        const db = getDatabase();

        // user_roles koleksiyonundan kullanıcının rol ID'lerini al
        const userRoles = await db.collection('user_roles')
            .find({ userId })
            .toArray();

        if (userRoles.length === 0) {
            return [];
        }

        // Rol ID'lerini ObjectId'ye çevir
        const { ObjectId } = await import('mongodb');
        const roleIds = userRoles.map(ur => new ObjectId(ur.roleId));

        // Rol detaylarını al
        const roles = await db.collection('roles')
            .find({ _id: { $in: roleIds } })
            .toArray();

        return roles;
    }

    /**
     * Kullanıcının en yüksek yetkili rolünü döndürür
     * Öncelik: SYSTEM_ADMIN > HR > MANAGER > EMPLOYEE
     */
    static async getPrimaryRole(userId) {
        const roles = await this.getUserRoles(userId);

        if (roles.length === 0) {
            return null;
        }

        // Rol öncelik sırası
        const rolePriority = {
            'SYSTEM_ADMIN': 1,
            'HR': 2,
            'MANAGER': 3,
            'EMPLOYEE': 4
        };

        // En yüksek yetkili rolü bul
        const primaryRole = roles.reduce((highest, current) => {
            const currentPriority = rolePriority[current.name] || 999;
            const highestPriority = rolePriority[highest.name] || 999;
            return currentPriority < highestPriority ? current : highest;
        });

        return primaryRole;
    }

    /**
     * Şifre hash'ler
     */
    static async hashPassword(password) {
        return await bcrypt.hash(password, SALT_ROUNDS);
    }

    /**
     * Şifre doğrular
     */
    static async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    /**
     * Kullanıcı oluşturur (yeni kullanıcı kaydetmek için)
     */
    static async create(userData) {
        const db = getDatabase();

        // Şifreyi hash'le
        if (userData.password) {
            userData.passwordHash = await this.hashPassword(userData.password);
            delete userData.password; // Plain password'u siliyoruz
        }

        const result = await db.collection('users').insertOne({
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return result;
    }

    /**
     * Kullanıcı günceller
     */
    static async updateByUserId(userId, updateData) {
        const db = getDatabase();

        const result = await db.collection('users').updateOne(
            { userId },
            {
                $set: {
                    ...updateData,
                    updatedAt: new Date()
                }
            }
        );

        return result;
    }
}
