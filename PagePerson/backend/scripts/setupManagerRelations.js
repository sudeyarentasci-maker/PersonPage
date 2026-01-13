import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'hr_agile_db';

async function setupEmployeeManagerRelations() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ MongoDB bağlantısı başarılı\n');

        const db = client.db(DB_NAME);

        // Önce mevcut ilişkileri temizle
        await db.collection('employee_manager').deleteMany({});
        console.log('🗑️  Mevcut ilişkiler temizlendi\n');

        // Manager'ı bul (ornek@firma.com = USR_001)
        const managerUser = await db.collection('users').findOne({ email: 'ornek@firma.com' });

        if (!managerUser) {
            console.log('❌ Manager kullanıcısı bulunamadı (ornek@firma.com)');
            return;
        }

        console.log(`✅ Manager bulundu: ${managerUser.email} (${managerUser.userId})\n`);

        // Employee'leri bul
        const employees = [
            { email: 'employee1@firma.com', userId: 'USR_EMP1' },
            { email: 'employee2@firma.com', userId: 'USR_EMP2' }
        ];

        console.log('👥 Employee-Manager ilişkileri kuruluyor...\n');

        for (const emp of employees) {
            const employee = await db.collection('users').findOne({ email: emp.email });

            if (employee) {
                await db.collection('employee_manager').insertOne({
                    employeeId: employee.userId,
                    managerId: managerUser.userId,
                    assignedAt: new Date()
                });
                console.log(`✅ ${emp.email} → ${managerUser.email}`);
            } else {
                console.log(`⚠️  ${emp.email} kullanıcısı bulunamadı`);
            }
        }

        console.log('\n═══════════════════════════════════════');
        console.log('🎉 İlişkiler başarıyla kuruldu!');
        console.log('═══════════════════════════════════════');
        console.log(`\n📋 Yapı:\n`);
        console.log(`Manager: ${managerUser.email} (${managerUser.userId})`);
        console.log(`  ├─ employee1@firma.com (USR_EMP1)`);
        console.log(`  └─ employee2@firma.com (USR_EMP2)`);
        console.log('\n✅ Artık EMPLOYEE\'ler izin talep edince MANAGER\'da görünecek!\n');

    } catch (error) {
        console.error('❌ Hata:', error);
    } finally {
        await client.close();
    }
}

setupEmployeeManagerRelations();
