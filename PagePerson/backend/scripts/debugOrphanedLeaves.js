/**
 * MongoDB'deki izinleri ve kullanıcıları direkt kontrol eden debug scripti
 */

import { connectToDatabase, closeDatabaseConnection, getDatabase } from '../config/database.js';

async function debugOrphanedLeaves() {
    try {
        await connectToDatabase();
        const db = getDatabase();

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 VERİTABANI DURUMU');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // 1. Tüm kullanıcıları listele
        const users = await db.collection('users').find({}).toArray();
        console.log(`👥 KULLANICILAR (${users.length} adet):`);
        users.forEach(user => {
            console.log(`  - ${user.userId}: ${user.email}`);
        });
        const validUserIds = users.map(u => u.userId);
        console.log('\n✅ Geçerli User ID\'ler:', validUserIds);

        // 2. Tüm izinleri listele
        const allLeaves = await db.collection('leaves').find({}).toArray();
        console.log(`\n📋 İZİNLER (${allLeaves.length} adet):\n`);

        allLeaves.forEach((leave, index) => {
            const isOrphaned = !validUserIds.includes(leave.userId);
            const status = isOrphaned ? '❌ YETİM' : '✅ GEÇERLİ';

            console.log(`${index + 1}. ${status}`);
            console.log(`   LeaveId: ${leave.leaveId}`);
            console.log(`   UserId: ${leave.userId}`);
            console.log(`   Tarih: ${leave.startDate} → ${leave.endDate}`);
            console.log(`   Tip: ${leave.leaveType}`);
            console.log(`   Durum: ${leave.status}`);
            console.log('');
        });

        // 3. Yetim izinleri bul
        const orphanedLeaves = allLeaves.filter(leave => !validUserIds.includes(leave.userId));

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`⚠️  YETİM İZİNLER: ${orphanedLeaves.length} adet`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        if (orphanedLeaves.length > 0) {
            orphanedLeaves.forEach((leave, index) => {
                console.log(`${index + 1}. UserId: "${leave.userId}"`);
                console.log(`   LeaveId: ${leave.leaveId}`);
                console.log(`   Tarih: ${leave.startDate} → ${leave.endDate}`);
                console.log(`   Tip: ${leave.leaveType}`);
                console.log('');
            });

            // Silme önerisi
            console.log('\n💡 Bu kayıtları silmek için cleanup endpoint çalıştırın.');
            console.log(`   Komut: POST /api/logs/cleanup-orphaned`);
        } else {
            console.log('✅ Yetim izin bulunamadı!\n');
        }

        // 4. Özet
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 ÖZET');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Toplam Kullanıcı: ${users.length}`);
        console.log(`Toplam İzin: ${allLeaves.length}`);
        console.log(`Geçerli İzin: ${allLeaves.length - orphanedLeaves.length}`);
        console.log(`Yetim İzin: ${orphanedLeaves.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await closeDatabaseConnection();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ HATA:', error);
        process.exit(1);
    }
}

debugOrphanedLeaves();
