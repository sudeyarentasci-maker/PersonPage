/**
 * Demo ve test kullanıcılarını temizleme scripti
 * Gerçek sistemde olmayan kullanıcıların verilerini veritabanından siler
 * 
 * Kullanım: npm run cleanup-demo
 */

import { connectToDatabase, closeDatabaseConnection, getDatabase } from '../config/database.js';

const demoUserEmails = [
    'john.doe@personpage.com',
    'jane.smith@personpage.com',
    'old.user@personpage.com'
];

async function cleanupDemoUsers() {
    try {
        console.log('🧹 Demo kullanıcı temizliği başlatılıyor...\n');

        const db = getDatabase();
        let totalCleaned = 0;

        for (const email of demoUserEmails) {
            const user = await db.collection('users').findOne({ email });

            if (!user) {
                console.log(`⏭️  Atlandı: ${email} (zaten yok)`);
                continue;
            }

            const userId = user.userId;
            console.log(`\n🗑️  Siliniyor: ${email} (${userId})`);

            // CASCADE DELETE - Kullanıcıya ait tüm verileri sil
            const rolesResult = await db.collection('user_roles').deleteMany({ userId });
            const managerResult = await db.collection('employee_manager').deleteMany({
                $or: [{ employeeId: userId }, { managerId: userId }]
            });
            const leavesResult = await db.collection('leaves').deleteMany({ userId });
            const announcementsResult = await db.collection('announcements').deleteMany({ createdBy: userId });
            const tasksResult = await db.collection('tasks').deleteMany({
                $or: [{ createdBy: userId }, { assignees: userId }]
            });
            await db.collection('users').deleteOne({ userId });

            console.log(`   ✓ Rol: ${rolesResult.deletedCount}`);
            console.log(`   ✓ Yönetici İlişkisi: ${managerResult.deletedCount}`);
            console.log(`   ✓ İzin: ${leavesResult.deletedCount}`);
            console.log(`   ✓ Duyuru: ${announcementsResult.deletedCount}`);
            console.log(`   ✓ Görev: ${tasksResult.deletedCount}`);
            console.log(`   ✓ Kullanıcı silindi`);

            totalCleaned++;
        }

        console.log(`\n✅ Temizlik tamamlandı! ${totalCleaned} demo kullanıcı silindi.`);
        return totalCleaned;

    } catch (error) {
        console.error('❌ Temizlik hatası:', error);
        throw error;
    }
}

// Script direkt çalıştırılırsa
async function main() {
    try {
        await connectToDatabase();
        const cleaned = await cleanupDemoUsers();
        await closeDatabaseConnection();
        process.exit(cleaned > 0 ? 0 : 1);
    } catch (error) {
        console.error('Script hatası:', error);
        process.exit(1);
    }
}

main();
