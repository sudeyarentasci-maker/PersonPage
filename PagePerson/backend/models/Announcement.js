import { getDatabase } from '../config/database.js';

/**
 * Announcement (Duyuru) Model
 */
export class Announcement {

    /**
     * Yeni duyuru oluştur
     */
    static async create(announcementData) {
        const db = getDatabase();

        // Son announcement ID'yi bul
        const lastAnnouncement = await db.collection('announcements')
            .find({})
            .sort({ announcementId: -1 })
            .limit(1)
            .toArray();

        let newAnnouncementNumber = 1;
        if (lastAnnouncement.length > 0) {
            const lastNumber = parseInt(lastAnnouncement[0].announcementId.split('_')[1]);
            newAnnouncementNumber = lastNumber + 1;
        }

        const announcementId = `ANN_${newAnnouncementNumber.toString().padStart(3, '0')}`;

        const newAnnouncement = {
            announcementId,
            title: announcementData.title,
            content: announcementData.content,
            createdBy: announcementData.createdBy,
            targetRoles: announcementData.targetRoles || ['EMPLOYEE', 'MANAGER', 'HR', 'SYSTEM_ADMIN'],
            priority: announcementData.priority || 'NORMAL',
            status: 'ACTIVE',
            createdAt: new Date(),
            expiresAt: announcementData.expiresAt ? new Date(announcementData.expiresAt) : null,
            updatedAt: new Date()
        };

        await db.collection('announcements').insertOne(newAnnouncement);
        return newAnnouncement;
    }

    /**
     * Kullanıcının rolüne göre duyuruları getir
     */
    static async findByUserRoles(userRoles) {
        const db = getDatabase();

        // Önce tarihi geçmiş ACTIVE duyuruları EXPIRED olarak işaretle
        await db.collection('announcements').updateMany(
            {
                status: 'ACTIVE',
                expiresAt: { $ne: null, $lte: new Date() }
            },
            {
                $set: {
                    status: 'EXPIRED',
                    updatedAt: new Date()
                }
            }
        );

        return await db.collection('announcements')
            .find({
                status: 'ACTIVE',
                targetRoles: { $in: userRoles },
                $or: [
                    { expiresAt: null },
                    { expiresAt: { $gt: new Date() } }
                ]
            })
            .sort({ priority: -1, createdAt: -1 })
            .toArray();
    }

    /**
     * Tüm duyuruları getir (HR/ADMIN için)
     */
    static async findAll() {
        const db = getDatabase();

        // Önce tarihi geçmiş ACTIVE duyuruları EXPIRED olarak işaretle
        await db.collection('announcements').updateMany(
            {
                status: 'ACTIVE',
                expiresAt: { $ne: null, $lte: new Date() }
            },
            {
                $set: {
                    status: 'EXPIRED',
                    updatedAt: new Date()
                }
            }
        );

        return await db.collection('announcements')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
    }

    /**
     * ID ile duyuru bul
     */
    static async findByAnnouncementId(announcementId) {
        const db = getDatabase();
        return await db.collection('announcements').findOne({ announcementId });
    }

    /**
     * Duyuru güncelle
     */
    static async update(announcementId, updateData) {
        const db = getDatabase();

        const result = await db.collection('announcements').updateOne(
            { announcementId },
            {
                $set: {
                    ...updateData,
                    updatedAt: new Date()
                }
            }
        );

        return result.modifiedCount > 0;
    }

    /**
     * Duyuru sil
     */
    static async delete(announcementId) {
        const db = getDatabase();

        const result = await db.collection('announcements').updateOne(
            { announcementId },
            {
                $set: {
                    status: 'DELETED',
                    updatedAt: new Date()
                }
            }
        );

        return result.modifiedCount > 0;
    }

    /**
     * Kullanıcı bilgilerini ekle
     */
    static async populateCreatorInfo(announcements) {
        const db = getDatabase();

        return await Promise.all(announcements.map(async (announcement) => {
            const creator = await db.collection('users').findOne(
                { userId: announcement.createdBy },
                { projection: { email: 1, userId: 1 } }
            );

            return {
                ...announcement,
                creatorEmail: creator?.email || 'Unknown'
            };
        }));
    }
}

export default Announcement;
