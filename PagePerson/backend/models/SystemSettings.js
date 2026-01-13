import { getDatabase } from '../config/database.js';

class SystemSettings {
    /**
     * Sistem ayarlarını getir
     */
    static async getSettings() {
        const db = getDatabase();
        const settings = await db.collection('system_settings').findOne({ _id: 'global' });

        // Varsayılan ayarlar
        if (!settings) {
            const defaultSettings = {
                _id: 'global',
                general: {
                    companyName: 'Şirket Adı',
                    workingHours: {
                        start: '09:00',
                        end: '18:00'
                    },
                    weeklyWorkDays: 5,
                    annualLeaveDays: 14,
                    timezone: 'Europe/Istanbul'
                },
                email: {
                    enabled: false,
                    smtpHost: '',
                    smtpPort: 587,
                    smtpSecure: true,
                    smtpUser: '',
                    smtpPassword: '',
                    fromEmail: '',
                    fromName: ''
                },
                security: {
                    passwordMinLength: 8,
                    passwordRequireUppercase: true,
                    passwordRequireNumbers: true,
                    passwordRequireSpecialChars: false,
                    sessionTimeout: 480, // minutes
                    maxLoginAttempts: 5,
                    lockoutDuration: 15, // minutes
                    twoFactorEnabled: false
                },
                backup: {
                    enabled: false,
                    frequency: 'daily', // daily, weekly, monthly
                    retentionDays: 30,
                    lastBackupDate: null
                },
                updatedAt: new Date(),
                updatedBy: null
            };

            await db.collection('system_settings').insertOne(defaultSettings);
            return defaultSettings;
        }

        return settings;
    }

    /**
     * Sistem ayarlarını güncelle
     */
    static async updateSettings(updates, userId) {
        const db = getDatabase();

        const updateData = {
            ...updates,
            updatedAt: new Date(),
            updatedBy: userId
        };

        const result = await db.collection('system_settings').updateOne(
            { _id: 'global' },
            { $set: updateData },
            { upsert: true }
        );

        return result.modifiedCount > 0 || result.upsertedCount > 0;
    }

    /**
     * Belirli bir kategoriyi güncelle
     */
    static async updateCategory(category, data, userId) {
        const db = getDatabase();

        const updateData = {
            [`${category}`]: data,
            updatedAt: new Date(),
            updatedBy: userId
        };

        const result = await db.collection('system_settings').updateOne(
            { _id: 'global' },
            { $set: updateData },
            { upsert: true }
        );

        return result.modifiedCount > 0 || result.upsertedCount > 0;
    }

    /**
     * Email ayarlarını test et
     */
    static async testEmailSettings(emailConfig) {
        // Bu basit bir placeholder - gerçek SMTP test için nodemailer gerekir
        try {
            // Burada nodemailer ile test email gönderebiliriz
            // Şimdilik sadece config validation yapıyoruz
            if (!emailConfig.smtpHost || !emailConfig.smtpUser || !emailConfig.fromEmail) {
                throw new Error('Eksik email konfigürasyonu');
            }

            return {
                success: true,
                message: 'Email ayarları geçerli görünüyor'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
}

export { SystemSettings };
