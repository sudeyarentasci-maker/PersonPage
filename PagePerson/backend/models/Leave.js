import { getDatabase } from '../config/database.js';

/**
 * Leave (İzin) Model
 */
export class Leave {

    /**
     * Yeni izin talebi oluştur
     */
    static async create(leaveData) {
        const db = getDatabase();

        // Son leave ID'yi bul ve yeni ID oluştur
        const lastLeave = await db.collection('leave_requests')
            .find({})
            .sort({ leaveId: -1 })
            .limit(1)
            .toArray();

        let newLeaveNumber = 1;
        if (lastLeave.length > 0) {
            const lastNumber = parseInt(lastLeave[0].leaveId.split('_')[1]);
            newLeaveNumber = lastNumber + 1;
        }

        const leaveId = `LV_${newLeaveNumber.toString().padStart(3, '0')}`;

        // İzin gün sayısını hesapla
        const start = new Date(leaveData.startDate);
        const end = new Date(leaveData.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const newLeave = {
            leaveId,
            userId: leaveData.userId,
            startDate: new Date(leaveData.startDate),
            endDate: new Date(leaveData.endDate),
            leaveType: leaveData.leaveType,
            days,
            reason: leaveData.reason,
            status: 'PENDING',
            managerId: leaveData.managerId || null,
            managerComment: '',
            hrComment: '',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await db.collection('leave_requests').insertOne(newLeave);
        return newLeave;
    }

    /**
     * Kullanıcının izinlerini getir
     */
    static async findByUserId(userId) {
        const db = getDatabase();
        return await db.collection('leave_requests')
            .find({ userId })
            .sort({ createdAt: -1 })
            .toArray();
    }

    /**
     * Ekip izinlerini getir (manager için)
     */
    static async findByManagerId(managerId) {
        const db = getDatabase();

        // Önce bu manager'ın ekip üyelerini bul
        const teamMembers = await db.collection('employee_manager')
            .find({ managerId })
            .toArray();

        const employeeIds = teamMembers.map(tm => tm.employeeId);

        // Bu çalışanların izinlerini getir
        return await db.collection('leave_requests')
            .find({ userId: { $in: employeeIds } })
            .sort({ createdAt: -1 })
            .toArray();
    }

    /**
     * Tüm izinleri getir (HR/ADMIN için)
     */
    static async findAll(filters = {}) {
        const db = getDatabase();
        const query = {};

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.leaveType) {
            query.leaveType = filters.leaveType;
        }

        return await db.collection('leave_requests')
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();
    }

    /**
     * Onay bekleyen izinleri getir
     */
    static async findPending(managerId = null) {
        const db = getDatabase();

        if (managerId) {
            // Manager kendi ekibinin pending izinlerini görsün
            const teamMembers = await db.collection('employee_manager')
                .find({ managerId })
                .toArray();

            const employeeIds = teamMembers.map(tm => tm.employeeId);

            return await db.collection('leave_requests')
                .find({
                    userId: { $in: employeeIds },
                    status: 'PENDING'
                })
                .sort({ createdAt: 1 })
                .toArray();
        } else {
            // HR/ADMIN tüm pending izinleri görsün
            return await db.collection('leave_requests')
                .find({ status: 'PENDING' })
                .sort({ createdAt: 1 })
                .toArray();
        }
    }

    /**
     * ID ile izin bul
     */
    static async findByLeaveId(leaveId) {
        const db = getDatabase();
        return await db.collection('leave_requests').findOne({ leaveId });
    }

    /**
     * İzin onayla
     */
    static async approve(leaveId, approverId, comment = '') {
        const db = getDatabase();

        const result = await db.collection('leave_requests').updateOne(
            { leaveId },
            {
                $set: {
                    status: 'APPROVED',
                    managerComment: comment,
                    approvedBy: approverId,
                    approvedAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );

        return result.modifiedCount > 0;
    }

    /**
     * İzin reddet
     */
    static async reject(leaveId, rejecterId, comment = '') {
        const db = getDatabase();

        const result = await db.collection('leave_requests').updateOne(
            { leaveId },
            {
                $set: {
                    status: 'REJECTED',
                    managerComment: comment,
                    rejectedBy: rejecterId,
                    rejectedAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );

        return result.modifiedCount > 0;
    }

    /**
     * Kullanıcının toplam izin günlerini hesapla
     */
    static async getTotalLeaveDays(userId, year = new Date().getFullYear()) {
        const db = getDatabase();

        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31);

        const leaves = await db.collection('leave_requests')
            .find({
                userId,
                status: 'APPROVED',
                startDate: { $gte: startOfYear, $lte: endOfYear }
            })
            .toArray();

        return leaves.reduce((total, leave) => total + leave.days, 0);
    }
}

export default Leave;
