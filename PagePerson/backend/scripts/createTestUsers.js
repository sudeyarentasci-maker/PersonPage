import bcrypt from 'bcrypt';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'hr_agile_db';

async function createTestUsers() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ MongoDB bağlantısı başarılı');

        const db = client.db(DB_NAME);

        // Rolleri bul
        const employeeRole = await db.collection('roles').findOne({ name: 'EMPLOYEE' });
        const managerRole = await db.collection('roles').findOne({ name: 'MANAGER' });
        const hrRole = await db.collection('roles').findOne({ name: 'HR' });
        const adminRole = await db.collection('roles').findOne({ name: 'SYSTEM_ADMIN' });

        console.log('\n📋 Roller bulundu');

        // Test kullanıcıları
        const users = [
            {
                userId: 'USR_EMP1',
                email: 'employee1@firma.com',
                password: '123456',
                roles: [employeeRole],
                managerId: 'USR_002' // ornek@firma.com manager olacak
            },
            {
                userId: 'USR_EMP2',
                email: 'employee2@firma.com',
                password: '123456',
                roles: [employeeRole],
                managerId: 'USR_002'
            }
        ];

        console.log('\n👥 Test kullanıcıları oluşturuluyor...\n');

        for (const userData of users) {
            // Kullanıcı var mı kontrol et
            const existing = await db.collection('users').findOne({ email: userData.email });

            if (existing) {
                console.log(`⚠️  ${userData.email} zaten mevcut, şifre güncelleniyor...`);
                const passwordHash = await bcrypt.hash(userData.password, 10);
                await db.collection('users').updateOne(
                    { email: userData.email },
                    { $set: { passwordHash, updatedAt: new Date() } }
                );
            } else {
                // Yeni kullanıcı oluştur
                const passwordHash = await bcrypt.hash(userData.password, 10);

                const newUser = {
                    userId: userData.userId,
                    email: userData.email,
                    passwordHash,
                    status: 'ACTIVE',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                await db.collection('users').insertOne(newUser);
                console.log(`✅ ${userData.email} oluşturuldu`);

                // Rolleri ata
                for (const role of userData.roles) {
                    await db.collection('user_roles').insertOne({
                        userId: userData.userId,
                        roleId: role._id
                    });
                }
                console.log(`   → Roller atandı: ${userData.roles.map(r => r.name).join(', ')}`);

                // Manager ilişkisini oluştur
                if (userData.managerId) {
                    await db.collection('employee_manager').insertOne({
                        employeeId: userData.userId,
                        managerId: userData.managerId,
                        assignedAt: new Date()
                    });
                    console.log(`   → Manager atandı: ${userData.managerId}`);
                }
            }
        }

        console.log('\n🎉 Test kullanıcıları hazır!\n');
        console.log('═══════════════════════════════════════');
        console.log('📧 Test Kullanıcıları:');
        console.log('═══════════════════════════════════════');
        console.log('1. EMPLOYEE: employee1@firma.com / 123456');
        console.log('2. EMPLOYEE: employee2@firma.com / 123456');
        console.log('3. MANAGER: or nek@firma.com / 123456');
        console.log('4. HR: hr@firma.com / 123456');
        console.log('5. ADMIN: admin@firma.com / admin123');
        console.log('═══════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Hata:', error);
    } finally {
        await client.close();
    }
}

createTestUsers();
