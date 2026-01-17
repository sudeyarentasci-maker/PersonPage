/**
 * USR_012 kullanıcısını kontrol eden debug script
 */

import { connectToDatabase, closeDatabaseConnection, getDatabase } from '../config/database.js';

async function checkUser012() {
    try {
        await connectToDatabase();
        const db = getDatabase();

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 USR_012 KULLANICISI KONTROLÜ');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // 1. USR_012 kullanıcısı var mı?
        const user = await db.collection('users').findOne({ userId: 'USR_012' });

        if (user) {
            console.log('✅ USR_012 BULUNDU:');
            console.log('   Email:', user.email);
            console.log('   First Name:', user.firstName);
            console.log('   Last Name:', user.lastName);
            console.log('   Status:', user.status);
        } else {
            console.log('❌ USR_012 BULUNAMADI - Kullanıcı silinmiş veya hiç oluşturulmamış!');
        }

        // 2. USR_012'nin izinlerini kontrol et
        const leaves = await db.collection('leaves').find({ userId: 'USR_012' }).toArray();
        console.log(`\n📋 USR_012'nin ${leaves.length} izin kaydı var:\n`);

        leaves.forEach((leave, index) => {
            console.log(`${index + 1}. ${leave.leaveId}`);
            console.log(`   Tarih: ${leave.startDate} → ${leave.endDate}`);
            console.log(`   Durum: ${leave.status}`);
            console.log(`   Tip: ${leave.leaveType}`);
            console.log(`   userName alanı: "${leave.userName || 'YOK'}"`);
            console.log('');
        });

        // 3. Tüm kullanıcıları listele
        const allUsers = await db.collection('users').find({}).toArray();
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`👥 TÜM KULLANICILAR (${allUsers.length}):`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        allUsers.forEach(u => {
            console.log(`${u.userId}: ${u.email} (${u.firstName || 'N/A'} ${u.lastName || 'N/A'})`);
        });

        await closeDatabaseConnection();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ HATA:', error);
        process.exit(1);
    }
}

checkUser012();
