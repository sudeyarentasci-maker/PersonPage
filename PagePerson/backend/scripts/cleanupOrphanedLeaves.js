/**
 * Sistemde olmayan kullanıcıların izin kayıtlarını temizleme scripti
 */

import { connectToDatabase, closeDatabaseConnection, getDatabase } from '../config/database.js';

async function cleanupOrphanedLeaves() {
    try {
        await connectToDatabase();
        const db = getDatabase();

        console.log('🧹 Yetim izin kayıtları temizleniyor...\n');

        // Tüm kullanıcı ID'lerini al
        const users = await db.collection('users').find({}, { projection: { userId: 1 } }).toArray();
        const validUserIds = users.map(u => u.userId);

        console.log(`✓ ${validUserIds.length} aktif kullanıcı bulundu`);

        // Geçersiz userId'ye sahip izinleri bul
        const orphanedLeaves = await db.collection('leaves').find({
            userId: { $nin: validUserIds }
        }).toArray();

        if (orphanedLeaves.length === 0) {
            console.log('\n✅ Yetim izin kaydı bulunamadı. Veritabanı temiz!');
            await closeDatabaseConnection();
            return 0;
        }

        console.log(`\n⚠️  ${orphanedLeaves.length} yetim izin kaydı tespit edildi:\n`);

        // Her yetim izin kaydını göster
        orphanedLeaves.forEach((leave, index) => {
            console.log(`${index + 1}. UserId: ${leave.userId}, Tarih: ${leave.startDate} - ${leave.endDate}, Tip: ${leave.leaveType}`);
        });

        // Yetim kayıtları sil
        const result = await db.collection('leaves').deleteMany({
            userId: { $nin: validUserIds }
        });

        console.log(`\n✅ ${result.deletedCount} yetim izin kaydı silindi!`);

        // Kalan izinleri göster
        const remainingLeaves = await db.collection('leaves').countDocuments();
        console.log(`📊 Kalan toplam izin kaydı: ${remainingLeaves}`);

        await closeDatabaseConnection();
        return result.deletedCount;

    } catch (error) {
        console.error('❌ Hata:', error);
        process.exit(1);
    }
}

// Script çalıştırılırsa
cleanupOrphanedLeaves().then(count => {
    process.exit(count > 0 ? 0 : 1);
});
