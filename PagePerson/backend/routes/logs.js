import express from 'express';
import { Log } from '../models/Log.js';

const router = express.Router();

// Logları getir (filtreleme ile)
router.get('/', async (req, res) => {
    try {
        const { type, startDate, endDate, search, limit } = req.query;

        const filters = {
            type,
            startDate,
            endDate,
            search,
            limit: limit ? parseInt(limit) : 100
        };

        const result = await Log.getAll(filters);

        if (result.success) {
            res.json({
                success: true,
                data: {
                    logs: result.logs,
                    total: result.total
                }
            });
        } else {
            throw result.error;
        }

    } catch (error) {
        console.error('Log getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Loglar getirilirken bir hata oluştu'
        });
    }
});

export default router;
