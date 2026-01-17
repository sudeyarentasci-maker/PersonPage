import { Log } from '../models/Log.js';

/**
 * Log kaydetme yardımcı fonksiyonları
 */

/**
 * Login log kaydı
 */
export async function logLogin(userId, userName, userEmail, success = true, details = '') {
    await Log.create({
        type: 'LOGIN',
        action: success ? 'Sisteme giriş yapıldı' : 'Giriş denemesi başarısız',
        userId,
        userName,
        userEmail,
        details: details || `Başarılı giriş - IP: ${getClientIP()}`,
        severity: success ? 'info' : 'warning'
    });
}

/**
 * Kullanıcı işlemi log kaydı
 */
export async function logUserAction(action, performedBy, targetUser, details = '') {
    await Log.create({
        type: 'USER_ACTION',
        action,
        userId: performedBy.userId,
        userName: performedBy.userName,
        userEmail: performedBy.userEmail,
        details: details || `Hedef kullanıcı: ${targetUser.email}`,
        severity: 'info'
    });
}

/**
 * İzin işlemi log kaydı
 */
export async function logLeaveAction(action, userId, userName, userEmail, details = '') {
    await Log.create({
        type: 'LEAVE',
        action,
        userId,
        userName,
        userEmail,
        details,
        severity: 'info'
    });
}

/**
 * Duyuru log kaydı
 */
export async function logAnnouncement(action, userId, userName, userEmail, details = '') {
    await Log.create({
        type: 'ANNOUNCEMENT',
        action,
        userId,
        userName,
        userEmail,
        details,
        severity: 'info'
    });
}

/**
 * Sistem ayarları log kaydı
 */
export async function logSettings(action, userId, userName, userEmail, details = '') {
    await Log.create({
        type: 'SETTINGS',
        action,
        userId,
        userName,
        userEmail,
        details,
        severity: 'warning'
    });
}

/**
 * Hata log kaydı
 */
export async function logError(action, details, userId = 'system', userName = 'Sistem') {
    await Log.create({
        type: 'ERROR',
        action,
        userId,
        userName,
        userEmail: '',
        details,
        severity: 'error'
    });
}

/**
 * Genel bilgi log kaydı
 */
export async function logInfo(action, details, userId = 'system', userName = 'Sistem') {
    await Log.create({
        type: 'INFO',
        action,
        userId,
        userName,
        userEmail: '',
        details,
        severity: 'info'
    });
}

/**
 * Client IP adresini al (basit implementasyon)
 */
function getClientIP() {
    return 'Bilinmiyor'; // REQ objesi olmadan IP alamıyoruz
}
