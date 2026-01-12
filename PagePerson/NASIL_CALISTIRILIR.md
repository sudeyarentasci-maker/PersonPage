# 🚀 HR Agile Sistemi - Başlatma Kılavuzu

## Adım 1️⃣: MongoDB'yi Başlatın

### MongoDB Servisi Kontrolü

MongoDB'nin çalıştığından emin olun:

**Yöntem 1 - Windows Servisi:**
```powershell
# MongoDB servisini kontrol et
net start MongoDB
```

**Yöntem 2 - Manuel Başlatma:**
```powershell
# MongoDB'yi manuel başlat
mongod
```

**Yöntem 3 - MongoDB Compass:**
- MongoDB Compass programını açın
- Bağlantı: `mongodb://localhost:27017`
- Bağlan'a tıklayın
- Sol tarafta `hr_agile_db` veritabanını görebilmelisiniz

---

## Adım 2️⃣: Backend Sunucusunu Başlatın

Yeni bir **PowerShell** veya **Terminal** açın:

```powershell
# Backend klasörüne git
cd d:\PersonPage\PagePerson\backend

# Sunucuyu başlat
npm run dev
```

### ✅ Başarılı Backend Çıktısı:

```
🔌 MongoDB'ye bağlanılıyor: mongodb://localhost:27017
✅ MongoDB bağlantısı başarılı: hr_agile_db

🚀 HR Agile Backend API başlatıldı!
📡 Server: http://localhost:5000
🌐 Frontend: http://localhost:5173
📊 Health: http://localhost:5000/api/health
```

> **NOT**: Bu terminal penceresini kapatmayın! Backend sürekli çalışmalı.

---

## Adım 3️⃣: Frontend Uygulamasını Başlatın

**BAŞKA BİR** terminal/PowerShell penceresi açın:

```powershell
# Ana proje klasörüne git
cd d:\PersonPage\PagePerson

# Frontend'i başlat
npm run dev
```

### ✅ Başarılı Frontend Çıktısı:

```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

> **NOT**: Bu terminal penceresini de kapatmayın!

---

## Adım 4️⃣: Tarayıcıda Test Edin

1. **Tarayıcınızı açın** (Chrome, Edge, Firefox vb.)
2. Adres çubuğuna gidin: **`http://localhost:5173`**
3. Login sayfası açılacak

### 🔑 Giriş Bilgileri:

- **Email**: `ornek@firma.com`
- **Şifre**: Herhangi bir şey yazın (örn: `123456`)

> **NOT**: Şu anda passwordHash olmadığı için demo modda, herhangi bir şifre kabul edilir.

4. **"Giriş Yap"** butonuna tıklayın
5. **Manager Dashboard** sayfasına yönlendirileceksiniz! 🎉

---

## 🎯 Test Senaryoları

### ✅ Test 1: Başarılı Giriş
- Login sayfasında email ve şifre girin
- **Beklenen**: `/manager` sayfasına yönlendirilme

### ✅ Test 2: Çıkış Yap
- Manager Dashboard'da sağ üstte **"Çıkış Yap"** butonuna tıklayın
- **Beklenen**: Login sayfasına dönme

### ✅ Test 3: Yetkisiz Erişim
- Manager olarak giriş yapın
- URL'yi manuel olarak değiştirin: `http://localhost:5173/admin`
- **Beklenen**: `/manager` sayfasına geri yönlendirilme (yetkisiz)

### ✅ Test 4: Token Persistence
- Giriş yapın
- Sayfayı yenileyin (F5)
- **Beklenen**: Hala giriş yapmış durumda olmalısınız, tekrar login istenmemeli

---

## ⚠️ Sorun Giderme

### 🔴 Problem: "MongoDB bağlantı hatası"

```
❌ MongoDB bağlantı hatası
```

**Çözüm:**
1. MongoDB'nin çalıştığından emin olun:
   ```powershell
   net start MongoDB
   ```
2. MongoDB Compass ile `localhost:27017` bağlantısını test edin
3. Firewall/antivirus MongoDB'yi engellemiyor mu kontrol edin

---

### 🔴 Problem: "Port 5000 already in use"

```
Error: Port 5000 is already in use
```

**Çözüm:**
Başka bir program 5000 portunu kullanıyor. Backend `.env` dosyasını düzenleyin:

```env
PORT=5001
```

Ardından backend'i yeniden başlatın.

---

### 🔴 Problem: "Cannot find module..."

```
Error: Cannot find module 'express'
```

**Çözüm:**
Backend veya frontend paketleri eksik. Yeniden kurun:

```powershell
# Backend için
cd d:\PersonPage\PagePerson\backend
npm install

# Frontend için
cd d:\PersonPage\PagePerson
npm install
```

---

### 🔴 Problem: "CORS Error"

```
Access to XMLHttpRequest blocked by CORS policy
```

**Çözüm:**
- Backend `.env` dosyasındaki `FRONTEND_URL` değerinin `http://localhost:5173` olduğundan emin olun
- Her iki sunucuyu da yeniden başlatın

---

## 📊 Hangi Terminal Hangi Komutu Çalıştırıyor?

Toplamda **3 pencere** açık olmalı:

| Pencere | Komut | Durum |
|---------|-------|-------|
| **Terminal 1** | `cd backend && npm run dev` | Backend sunucu (5000 portu) |
| **Terminal 2** | `cd .. && npm run dev` | Frontend sunucu (5173 portu) |
| **Tarayıcı** | `http://localhost:5173` | Uygulama arayüzü |

---

## 🛑 Sistemi Durdurma

Her iki terminalde de `Ctrl + C` tuşlarına basın:

```powershell
# Terminal 1 (Backend)
Ctrl + C

# Terminal 2 (Frontend)
Ctrl + C
```

---

## ✅ Hazırsınız!

Artık HR Agile sisteminiz çalışıyor! 🎊

**Sonraki adımlar:**
- MongoDB'de passwordHash ekleyin (güvenlik için)
- Her dashboard'a özel özellikler ekleyin
- Yeni kullanıcılar oluşturun
- Sistem ayarlarını özelleştirin

Başka bir sorunuz varsa sormaktan çekinmeyin! 😊
