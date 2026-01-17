/**
 * Veritabanındaki tüm kullanıcıları listele ve demo kullanıcıları otomatik bul ve sil
 */

import { connectToDatabase, closeDatabaseConnection, getDatabase } from '../config/database.js';

async function findAndCleanupDemoUsers() {
    try {
        await connectToDatabase();
        const db = getDatabase();

        console.log('📋 Veritabanındaki tüm kullanıcılar listeleniyor...\n');

        // Tüm kullanıcıları getir
        const allUsers = await db.collection('users').find({}).toArray();

        console.log(`Toplam ${allUsers.length} kullanıcı bulundu:\n`);
        allUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email} (${user.userId})`);
        });

        // Gerçek kullanıcılar (silinmemesi gerekenler)
        const realUserEmails = [
            'admin@personpage.com',
            'hr@personpage.com',
            'manager@personpage.com'
        ];

        // Demo kullanıcıları bul
        const demoUsers = allUsers.filter(user => !realUserEmails.includes(user.email));

        if (demoUsers.length === 0) {
            console.log('\n✅ Demo kullanıcı bulunamadı. Veritabanı temiz!');
            await closeDatabaseConnection();
            return;
        }

        console.log(`\n🗑️  ${demoUsers.length} demo kullanıcı tespit edildi, siliniyor...\n`);

        // Her demo kullanıcıyı sil (CASCADE DELETE)
        for (const user of demoUsers) {
            const userId = user.userId;
            const email = user.email;

            console.log(`\n🗑️  Siliniyor: ${email} (${userId})`);

            // CASCADE DELETE
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
            console.log(`   ✓ Yönetici: ${managerResult.deletedCount}`);
            console.log(`   ✓ İzin: ${leavesResult.deletedCount}`);
            console.log(`   ✓ Duyuru: ${announcementsResult.deletedCount}`);
            console.log(`   ✓ Görev: ${tasksResult.deletedCount}`);
            console.log(`   ✅ Kullanıcı silindi`);
        }

        console.log(`\n\n✅ TÜM DEMO KULLANICILAR SİLİNDİ!`);
        console.log(`📊 Toplam ${demoUsers.length} kullanıcı ve ilgili verileri temizlendi.`);

        // Son durumu göster
        const remainingUsers = await db.collection('users').find({}).toArray();
        console.log(`\n📋 Kalan kullanıcılar (${remainingUsers.length}):`);
        remainingUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email}`);
        });

        await closeDatabaseConnection();

    } catch (error) {
        console.error('❌ Hata:', error);
        process.exit(1);
    }
}

findAndCleanupDemoUsers();
