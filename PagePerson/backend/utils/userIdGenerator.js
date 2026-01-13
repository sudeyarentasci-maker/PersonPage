import { getDatabase } from '../config/database.js';

/**
 * Otomatik artan userId oluşturur (USR_XXX formatında)
 * @returns {Promise<string>} Yeni userId
 */
export async function generateUserId() {
    const db = getDatabase();

    // En son oluşturulan kullanıcıyı bul (createdAt'e göre sırala)
    const lastUser = await db.collection('users')
        .find({})
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray();

    if (lastUser.length === 0) {
        // Hiç kullanıcı yoksa ilk ID
        return 'USR_001';
    }

    // Son userId'den numarayı çıkar
    const lastUserId = lastUser[0].userId;
    const match = lastUserId.match(/USR_(\d+)|USR_EMP(\d+)/);

    let lastNumber = 0;
    if (match) {
        // USR_001 veya USR_EMP1 formatlarını destekle
        lastNumber = parseInt(match[1] || match[2] || '0');
    }

    // Tüm kullanıcıları say (alternatif yöntem)
    const userCount = await db.collection('users').countDocuments();

    // İki yöntemden büyük olanı al
    const newNumber = Math.max(lastNumber, userCount) + 1;

    // 3 haneli formatta döndür (USR_001, USR_002, ...)
    return `USR_${newNumber.toString().padStart(3, '0')}`;
}
