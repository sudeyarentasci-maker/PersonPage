import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'hr_agile_db';

async function fixAdminRoles() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ MongoDB bağlantısı başarılı\n');

        const db = client.db(DB_NAME);

        // Admin kullanıcısını bul
        const adminUser = await db.collection('users').findOne({ email: 'admin@firma.com' });

        if (!adminUser) {
            console.log('❌ Admin kullanıcısı bulunamadı!');
            return;
        }

        console.log('Admin User ID:', adminUser.userId);

        // SYSTEM_ADMIN rolünü bul
        const systemAdminRole = await db.collection('roles').findOne({ name: 'SYSTEM_ADMIN' });

        if (!systemAdminRole) {
            console.log('❌ SYSTEM_ADMIN rolü bulunamadı!');
            return;
        }

        console.log('SYSTEM_ADMIN Role ID:', systemAdminRole._id);

        // Mevcut rolleri kontrol et
        const existingRoles = await db.collection('user_roles')
            .find({ userId: adminUser.userId })
            .toArray();

        console.log('\nMevcut roller:', existingRoles);

        // SYSTEM_ADMIN rolü yoksa ekle
        const hasSystemAdmin = existingRoles.some(
            ur => ur.roleId.toString() === systemAdminRole._id.toString()
        );

        if (!hasSystemAdmin) {
            await db.collection('user_roles').insertOne({
                userId: adminUser.userId,
                roleId: systemAdminRole._id
            });
            console.log('\n✅ SYSTEM_ADMIN rolü eklendi!');
        } else {
            console.log('\n✅ SYSTEM_ADMIN rolü zaten var!');
        }

        // Güncel rolleri göster
        const updatedRoles = await db.collection('user_roles')
            .find({ userId: adminUser.userId })
            .toArray();

        console.log('\n📋 Güncel roller:');
        for (const ur of updatedRoles) {
            const role = await db.collection('roles').findOne({ _id: ur.roleId });
            console.log(`  - ${role.name}`);
        }

    } catch (error) {
        console.error('❌ Hata:', error);
    } finally {
        await client.close();
    }
}

fixAdminRoles();
