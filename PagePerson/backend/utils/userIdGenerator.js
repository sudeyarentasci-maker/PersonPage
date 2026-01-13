import { getDatabase } from '../config/database.js';

/**
 * Otomatik artan userId oluşturur (USR_XXX formatında)
 * @returns {Promise<string>} Yeni userId
 */
export async function generateUserId() {
    const db = getDatabase();

    // En son oluşturulan kullanıcıyı bul
    const lastUser = await db.collection('users')
        .find({})
        .sort({ userId: -1 })
        .limit(1)
        .toArray();

    if (lastUser.length === 0) {
        // Hiç kullanıcı yoksa ilk ID
        return 'USR_001';
    }

    // Son userId'den numarayı çıkar ve 1 artır
    const lastUserId = lastUser[0].userId;
    const lastNumber = parseInt(lastUserId.split('_')[1]);
    const newNumber = lastNumber + 1;

    // 3 haneli formatta döndür (USR_001, USR_002, ...)
    return `USR_${newNumber.toString().padStart(3, '0')}`;
}
