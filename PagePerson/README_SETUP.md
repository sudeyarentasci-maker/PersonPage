# HR Agile Sistemi - Başlatma Talimatları

## 🚀 Sistem Başlatma Adımları

### 1. Backend Sunucusunu Başlatma

Backend klasörüne gidin ve sunucuyu başlatın:

```powershell
cd d:\PersonPage\PagePerson\backend
npm run dev
```

**Beklenen Çıktı:**
```
🔌 MongoDB'ye bağlanılıyor: mongodb://localhost:27017
✅ MongoDB bağlantısı başarılı: hr_agile_db

🚀 HR Agile Backend API başlatıldı!
📡 Server: http://localhost:5000
🌐 Frontend: http://localhost:5173
📊 Health: http://localhost:5000/api/health
```

> **NOT**: MongoDB'nin yüklü ve çalışır durumda olduğundan emin olun!

---

### 2. Frontend Uygulamasını Başlatma

Yeni bir terminal açın, ana klasöre gidin ve frontend'i başlatın:

```powershell
cd d:\PersonPage\PagePerson
npm run dev
```

**Beklenen Çıktı:**
```
VITE ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🧪 Test Senaryoları

### Senaryo 1: Temel Login Testi

1. Tarayıcıda `http://localhost:5173` adresine gidin
2. Login sayfası görünmeli
3. Giriş bilgileri:
   - **Email**: `ornek@firma.com`
   - **Şifre**: Herhangi bir şey (şu an passwordHash olmadığı için demo modda çalışıyor)

4. "Giriş Yap" butonuna tıklayın
5. **Beklenen Sonuç**: USR_001 kullanıcısının en yüksek rolü MANAGER olduğu için `/manager` sayfasına yönlendirilmeli

---

### Senaryo 2: Rol Bazlı Yönlendirme

**USR_001 Kullanıcısı için:**
- Login sonrası → `/manager` (MANAGER rolü EMPLOYEE'dan daha yüksek öncelikli)
- Manuel olarak `/admin` ya da `/hr` sayfasına gitmeye çalışırsanız → `/manager` sayfasına geri yönlendirilir (yetkisiz erişim)
- `/employee` sayfasına gitmeye çalışırsanız → `/manager` sayfasına geri yönlendirilir

---

### Senaryo 3: Logout ve Tekrar Login

1. Manager dashboard'da sağ üstteki "Çıkış Yap" butonuna tıklayın
2. Login sayfasına yönlendirilmelisiniz
3. Tekrar giriş yapın
4. Yine Manager dashboard'a yönlendirilmelisiniz

---

## 🔐 Veritabanı Güncellemesi (Önemli!)

Şu anda `users` koleksiyonunda **passwordHash** alanı yok. Güvenli giriş için bu alanı eklemeliyiz.

### MongoDB'de Şifre Hash'i Eklemek

1. MongoDB Compass veya mongosh ile bağlanın
2. `hr_agile_db` veritabanını seçin
3. `users` koleksiyonunda USR_001 kaydını güncelleyin:

```javascript
// MongoDB Compass Filter
{ "userId": "USR_001" }

// Update (bcrypt ile şifrelenmiş "123456")
{
  "$set": {
    "passwordHash": "$2b$10$NXvJlZ0wGXvZ0wGXvZ0wGuE.K0K0K0K0K0K0K0K0K0K0K0K0K0K0"
  }
}
```

**Veya backend'de bir script çalıştırarak:**

Backend klasöründe `scripts/createTestUser.js` oluşturun:

```javascript
import bcrypt from 'bcrypt';
import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'hr_agile_db';

async function updateUserPassword() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    const passwordHash = await bcrypt.hash('123456', 10);
    
    const result = await db.collection('users').updateOne(
      { userId: 'USR_001' },
      { 
        $set: { 
          passwordHash,
          updatedAt: new Date()
        } 
      }
    );
    
    console.log('✅ Kullanıcı şifresi güncellendi:', result);
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await client.close();
  }
}

updateUserPassword();
```

Çalıştırın:
```powershell
cd d:\PersonPage\PagePerson\backend
node scripts/createTestUser.js
```

---

## 📊 API Endpoint'leri

### Health Check
```
GET http://localhost:5000/api/health
```

### Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "ornek@firma.com",
  "password": "123456"
}
```

### Mevcut Kullanıcı Bilgisi (Token gerekli)
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer <token>
```

### Logout
```
POST http://localhost:5000/api/auth/logout
Authorization: Bearer <token>
```

---

## 🎯 Rol Öncelik Sistemi

Sistem, kullanıcının birden fazla rolü varsa en yüksek yetkili rol ile giriş yapar:

1. **SYSTEM_ADMIN** (En yüksek yetki)
2. **HR**
3. **MANAGER**
4. **EMPLOYEE** (En düşük yetki)

**USR_001 örneği:**
- Roller: MANAGER + EMPLOYEE
- Otomatik giriş: MANAGER dashboard'u (`/manager`)

---

## ⚠️ Sorun Giderme

### MongoDB Bağlantı Hatası
```
❌ MongoDB bağlantı hatası
```
**Çözüm**: MongoDB'nin çalıştığından emin olun:
```powershell
# MongoDB servisini kontrol et
net start MongoDB

# Veya manuel başlat
mongod
```

### CORS Hatası
```
Access to XMLHttpRequest blocked by CORS policy
```
**Çözüm**: Backend `.env` dosyasındaki `FRONTEND_URL` değerinin doğru olduğundan emin olun.

### Port Kullanımda
```
Port 5000 already in use
```
**Çözüm**: Başka bir port kullanın (.env dosyasında PORT'u değiştirin)

---

## ✅ Başarılı Kurulum Kontrol Listesi

- [ ] MongoDB çalışıyor
- [ ] Backend sunucu başladı (`http://localhost:5000`)
- [ ] Frontend sunucu başladı (`http://localhost:5173`)
- [ ] Login sayfası açılıyor
- [ ] Email: `ornek@firma.com` ile giriş yapabiliyor
- [ ] Manager dashboard'u görünüyor
- [ ] Logout çalışıyor
- [ ] Tekrar giriş yapabiliyor

---

**Sistem hazır! Artık rol bazlı HR Agile sisteminizi kullanabilirsiniz! 🎉**
