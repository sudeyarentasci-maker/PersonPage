import bcrypt from 'bcrypt';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'hr_agile_db';

async function createHRUser() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ MongoDB bağlantısı başarılı');

        const db = client.db(DB_NAME);

        // HR rolünü bul
        const hrRole = await db.collection('roles').findOne({ name: 'HR' });

        if (!hrRole) {
            console.error('❌ HR rolü bulunamadı!');
            return;
        }

        console.log('✅ HR rolü bulundu:', hrRole._id);

        // hr@firma.com kullanıcısı var mı kontrol et
        const existingUser = await db.collection('users').findOne({ email: 'hr@firma.com' });

        if (existingUser) {
            console.log('⚠️ hr@firma.com kullanıcısı zaten mevcut!');

            // Şifreyi güncelle
            const passwordHash = await bcrypt.hash('123456', 10);
            await db.collection('users').updateOne(
                { email: 'hr@firma.com' },
                {
                    $set: {
                        passwordHash,
                        updatedAt: new Date()
                    }
                }
            );
            console.log('✅ Şifre güncellendi: 123456');

        } else {
            // Yeni kullanıcı oluştur
            const passwordHash = await bcrypt.hash('123456', 10);

            const newUser = {
                userId: 'USR_002',
                email: 'hr@firma.com',
                passwordHash,
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await db.collection('users').insertOne(newUser);
            console.log('✅ HR kullanıcısı oluşturuldu:', newUser.userId);

            // user_roles ekle
            await db.collection('user_roles').insertOne({
                userId: 'USR_002',
                roleId: hrRole._id
            });
            console.log('✅ HR rolü atandı');
        }

        console.log('\n🎉 HR kullanıcısı hazır!');
        console.log('Email: hr@firma.com');
        console.log('Şifre: 123456');

    } catch (error) {
        console.error('❌ Hata:', error);
    } finally {
        await client.close();
    }
}

createHRUser();
