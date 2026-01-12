import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'hr_agile_db';

let db = null;
let client = null;

/**
 * MongoDB bağlantısını başlatır
 */
export async function connectToDatabase() {
    try {
        if (db) {
            console.log('📦 Mevcut MongoDB bağlantısı kullanılıyor');
            return db;
        }

        console.log(`🔌 MongoDB'ye bağlanılıyor: ${MONGODB_URI}`);
        client = new MongoClient(MONGODB_URI);
        await client.connect();

        db = client.db(DB_NAME);
        console.log(`✅ MongoDB bağlantısı başarılı: ${DB_NAME}`);

        return db;
    } catch (error) {
        console.error('❌ MongoDB bağlantı hatası:', error);
        throw error;
    }
}

/**
 * Veritabanı instance'ını döndürür
 */
export function getDatabase() {
    if (!db) {
        throw new Error('Database bağlantısı henüz kurulmamış! connectToDatabase() çağırın.');
    }
    return db;
}

/**
 * MongoDB bağlantısını kapatır
 */
export async function closeDatabaseConnection() {
    if (client) {
        await client.close();
        db = null;
        client = null;
        console.log('🔌 MongoDB bağlantısı kapatıldı');
    }
}
