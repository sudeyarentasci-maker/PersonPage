import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase, closeDatabaseConnection } from './config/database.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import leavesRoutes from './routes/leaves.js';
import announcementsRoutes from './routes/announcements.js';
import systemSettingsRoutes from './routes/systemSettings.js';
import tasksRoutes from './routes/tasks.js';
import dashboardRoutes from './routes/dashboard.js';

// Environment variables yükle
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/leaves', leavesRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/system-settings', systemSettingsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'HR Agile Backend API çalışıyor',
        timestamp: new Date().toISOString()
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint bulunamadı'
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Sunucu hatası:', err);
    res.status(500).json({
        success: false,
        message: 'Sunucu hatası',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Sunucuyu başlat
async function startServer() {
    try {
        // MongoDB bağlantısını kur
        await connectToDatabase();

        // Express sunucusunu başlat
        app.listen(PORT, () => {
            console.log(`\n🚀 HR Agile Backend API başlatıldı!`);
            console.log(`📡 Server: http://localhost:${PORT}`);
            console.log(`🌐 Frontend: ${FRONTEND_URL}`);
            console.log(`📊 Health: http://localhost:${PORT}/api/health\n`);
        });
    } catch (error) {
        console.error('❌ Sunucu başlatılamadı:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Sunucu kapatılıyor...');
    await closeDatabaseConnection();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Sunucu kapatılıyor...');
    await closeDatabaseConnection();
    process.exit(0);
});

// Sunucuyu başlat
startServer();
