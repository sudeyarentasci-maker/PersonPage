import express from 'express';

const router = express.Router();

// Demo log verileri
const demoLogs = [
    {
        logId: 1,
        timestamp: new Date('2026-01-17T10:30:00'),
        user: 'admin@personpage.com',
        userName: 'Admin User',
        action: 'Sisteme giriş yapıldı',
        type: 'LOGIN',
        details: 'Başarılı giriş - IP: 192.168.1.100',
        severity: 'info'
    },
    {
        logId: 2,
        timestamp: new Date('2026-01-17T10:35:00'),
        user: 'admin@personpage.com',
        userName: 'Admin User',
        action: 'Yeni kullanıcı oluşturuldu',
        type: 'USER_ACTION',
        details: 'Kullanıcı: john.doe@personpage.com (EMPLOYEE)',
        severity: 'info'
    },
    {
        logId: 3,
        timestamp: new Date('2026-01-17T11:00:00'),
        user: 'hr@personpage.com',
        userName: 'HR Manager',
        action: 'Duyuru oluşturuldu',
        type: 'ANNOUNCEMENT',
        details: 'Başlık: Yeni Şirket Politikası',
        severity: 'info'
    },
    {
        logId: 4,
        timestamp: new Date('2026-01-17T11:30:00'),
        user: 'manager@personpage.com',
        userName: 'Team Manager',
        action: 'İzin talebi onaylandı',
        type: 'LEAVE',
        details: 'Çalışan: jane.smith@personpage.com - 5 gün yıllık izin',
        severity: 'info'
    },
    {
        logId: 5,
        timestamp: new Date('2026-01-17T12:00:00'),
        user: 'admin@personpage.com',
        userName: 'Admin User',
        action: 'Sistem ayarları güncellendi',
        type: 'SETTINGS',
        details: 'Değiştirilen: Yıllık izin limiti (14 → 20 gün)',
        severity: 'warning'
    },
    {
        logId: 6,
        timestamp: new Date('2026-01-17T13:15:00'),
        user: 'employee@personpage.com',
        userName: 'John Doe',
        action: 'İzin talebi oluşturuldu',
        type: 'LEAVE',
        details: '3 gün kişisel izin - Tarih: 2026-01-20 / 2026-01-22',
        severity: 'info'
    },
    {
        logId: 7,
        timestamp: new Date('2026-01-17T14:00:00'),
        user: 'system',
        userName: 'Sistem',
        action: 'Veritabanı bağlantısı hatası',
        type: 'ERROR',
        details: 'MongoDB bağlantısı geçici olarak kesildi - Otomatik yeniden bağlanıldı',
        severity: 'error'
    },
    {
        logId: 8,
        timestamp: new Date('2026-01-17T14:30:00'),
        user: 'hr@personpage.com',
        userName: 'HR Manager',
        action: 'Kullanıcı bilgileri güncellendi',
        type: 'USER_ACTION',
        details: 'Kullanıcı: jane.smith@personpage.com - Departman değişikliği',
        severity: 'info'
    },
    {
        logId: 9,
        timestamp: new Date('2026-01-17T15:00:00'),
        user: 'admin@personpage.com',
        userName: 'Admin User',
        action: 'Kullanıcı silindi',
        type: 'USER_ACTION',
        details: 'Kullanıcı: old.user@personpage.com',
        severity: 'warning'
    },
    {
        logId: 10,
        timestamp: new Date('2026-01-17T15:30:00'),
        user: 'manager@personpage.com',
        userName: 'Team Manager',
        action: 'İzin talebi reddedildi',
        type: 'LEAVE',
        details: 'Çalışan: john.doe@personpage.com - Sebep: Ekip yoğunluğu',
        severity: 'warning'
    },
    {
        logId: 11,
        timestamp: new Date('2026-01-17T16:00:00'),
        user: 'system',
        userName: 'Sistem',
        action: 'Yedekleme tamamlandı',
        type: 'INFO',
        details: 'Günlük veritabanı yedeği başarıyla oluşturuldu',
        severity: 'info'
    },
    {
        logId: 12,
        timestamp: new Date('2026-01-17T16:15:00'),
        user: 'employee@personpage.com',
        userName: 'Jane Smith',
        action: 'Profil güncellendi',
        type: 'USER_ACTION',
        details: 'Telefon numarası ve adres bilgileri güncellendi',
        severity: 'info'
    }
];

// Logları getir (filtreleme ile)
router.get('/', async (req, res) => {
    try {
        const { type, startDate, endDate, search } = req.query;

        let filteredLogs = [...demoLogs];

        // Tip filtreleme
        if (type && type !== 'ALL') {
            filteredLogs = filteredLogs.filter(log => log.type === type);
        }

        // Tarih filtreleme
        if (startDate) {
            const start = new Date(startDate);
            filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= start);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= end);
        }

        // Arama filtreleme
        if (search) {
            const searchLower = search.toLowerCase();
            filteredLogs = filteredLogs.filter(log =>
                log.action.toLowerCase().includes(searchLower) ||
                log.userName.toLowerCase().includes(searchLower) ||
                log.details.toLowerCase().includes(searchLower)
            );
        }

        // Tarihe göre sırala (en yeni önce)
        filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({
            success: true,
            data: {
                logs: filteredLogs,
                total: filteredLogs.length
            }
        });
    } catch (error) {
        console.error('Log getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Loglar getirilirken bir hata oluştu'
        });
    }
});

export default router;
