import { getDatabase } from '../config/database.js';

/**
 * Log Model - Sistem olaylarını kaydetmek için
 */

class Log {
    /**
     * Yeni log kaydı oluştur
     * @param {Object} logData - Log verisi
     * @param {string} logData.type - Log tipi (LOGIN, USER_ACTION, SETTINGS, ANNOUNCEMENT, LEAVE, ERROR, INFO)
     * @param {string} logData.action - İşlem açıklaması
     * @param {string} logData.userId - İşlemi yapan kullanıcı ID (sistem için 'system')
     * @param {string} logData.userName - Kullanıcı adı
     * @param {string} logData.userEmail - Kullanıcı email
     * @param {string} logData.details - Detaylı açıklama
     * @param {string} logData.severity - Önem derecesi (info, warning, error)
     * @param {Object} logData.metadata - Ek veri
     */
    static async create(logData) {
        try {
            const db = getDatabase();

            const log = {
                type: logData.type,
                action: logData.action,
                userId: logData.userId,
                userName: logData.userName || 'Bilinmeyen',
                userEmail: logData.userEmail || '',
                details: logData.details || '',
                severity: logData.severity || 'info',
                metadata: logData.metadata || {},
                timestamp: new Date(),
                createdAt: new Date()
            };

            const result = await db.collection('logs').insertOne(log);
            return { success: true, logId: result.insertedId };
        } catch (error) {
            console.error('Log kaydetme hatası:', error);
            // Log kaydetme hatası sistem çalışmasını etkilememeli
            return { success: false, error };
        }
    }

    /**
     * Logları getir (filtreleme ile)
     */
    static async getAll(filters = {}) {
        try {
            const db = getDatabase();
            const query = {};

            // Tip filtreleme
            if (filters.type && filters.type !== 'ALL') {
                query.type = filters.type;
            }

            // Tarih filtreleme
            if (filters.startDate || filters.endDate) {
                query.timestamp = {};
                if (filters.startDate) {
                    query.timestamp.$gte = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    const endDate = new Date(filters.endDate);
                    endDate.setHours(23, 59, 59, 999);
                    query.timestamp.$lte = endDate;
                }
            }

            // Arama filtreleme
            if (filters.search) {
                const searchRegex = new RegExp(filters.search, 'i');
                query.$or = [
                    { action: searchRegex },
                    { userName: searchRegex },
                    { userEmail: searchRegex },
                    { details: searchRegex }
                ];
            }

            const logs = await db.collection('logs')
                .find(query)
                .sort({ timestamp: -1 }) // En yeni önce
                .limit(filters.limit || 100)
                .toArray();

            return { success: true, logs, total: logs.length };
        } catch (error) {
            console.error('Log getirme hatası:', error);
            return { success: false, error };
        }
    }

    /**
     * Eski logları temizle (opsiyonel)
     */
    static async cleanup(daysToKeep = 90) {
        try {
            const db = getDatabase();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const result = await db.collection('logs').deleteMany({
                timestamp: { $lt: cutoffDate }
            });

            return { success: true, deletedCount: result.deletedCount };
        } catch (error) {
            console.error('Log temizleme hatası:', error);
            return { success: false, error };
        }
    }
}

export { Log };
