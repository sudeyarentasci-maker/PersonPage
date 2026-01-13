import bcrypt from 'bcrypt';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'hr_agile_db';

async function createAdminUser() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ MongoDB bağlantısı başarılı');

        const db = client.db(DB_NAME);

        // SYSTEM_ADMIN rolünü bul
        const adminRole = await db.collection('roles').findOne({ name: 'SYSTEM_ADMIN' });

        if (!adminRole) {
            console.error('❌ SYSTEM_ADMIN rolü bulunamadı!');
            return;
        }

        console.log('✅ SYSTEM_ADMIN rolü bulundu:', adminRole._id);

        // admin@firma.com kullanıcısı var mı kontrol et
        const existingUser = await db.collection('users').findOne({ email: 'admin@firma.com' });

        if (existingUser) {
            console.log('⚠️ admin@firma.com kullanıcısı zaten mevcut!');

            // Şifreyi güncelle
            const passwordHash = await bcrypt.hash('admin123', 10);
            await db.collection('users').updateOne(
                { email: 'admin@firma.com' },
                {
                    $set: {
                        passwordHash,
                        updatedAt: new Date()
                    }
                }
            );
            console.log('✅ Şifre güncellendi: admin123');

        } else {
            // Yeni kullanıcı oluştur
            const passwordHash = await bcrypt.hash('admin123', 10);

            const newUser = {
                userId: 'USR_ADMIN',
                email: 'admin@firma.com',
                passwordHash,
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await db.collection('users').insertOne(newUser);
            console.log('✅ ADMIN kullanıcısı oluşturuldu:', newUser.userId);

            // user_roles ekle
            await db.collection('user_roles').insertOne({
                userId: 'USR_ADMIN',
                roleId: adminRole._id
            });
            console.log('✅ SYSTEM_ADMIN rolü atandı');
        }

        console.log('\n🎉 ADMIN kullanıcısı hazır!');
        console.log('Email: admin@firma.com');
        console.log('Şifre: admin123');

    } catch (error) {
        console.error('❌ Hata:', error);
    } finally {
        await client.close();
    }
}

createAdminUser();
