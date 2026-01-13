/**
 * Rastgele güçlü şifre oluşturur
 * @param {number} length - Şifre uzunluğu (varsayılan: 10)
 * @returns {string} Oluşturulan şifre
 */
export function generateRandomPassword(length = 10) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%&*';

    const allChars = lowercase + uppercase + numbers + symbols;

    let password = '';

    // En az 1 küçük harf
    password += lowercase[Math.floor(Math.random() * lowercase.length)];

    // En az 1 büyük harf
    password += uppercase[Math.floor(Math.random() * uppercase.length)];

    // En az 1 rakam
    password += numbers[Math.floor(Math.random() * numbers.length)];

    // En az 1 özel karakter
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Kalan karakterleri rastgele ekle
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Şifreyi karıştır
    return password.split('').sort(() => Math.random() - 0.5).join('');
}
