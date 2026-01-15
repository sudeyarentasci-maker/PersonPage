import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Task from '../models/Task.js';
import Section from '../models/Section.js';

const router = express.Router();

// --- SECTIONS ---

// Get all sections (and optionally tasks nested)
router.get('/sections', authenticateToken, async (req, res) => {
    try {
        await Section.seedDefaultSections(); // Ensure defaults exist
        const sections = await Section.findAll();

        // Fetch tasks for each section to make frontend life easier
        const sectionsWithTasks = await Promise.all(sections.map(async (section) => {
            const tasks = await Task.findBySection(section._id);
            return { ...section, tasks };
        }));

        res.json({ success: true, data: sectionsWithTasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/sections', authenticateToken, async (req, res) => {
    try {
        const section = await Section.create(req.body);
        res.status(201).json({ success: true, data: section });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- TASKS ---

router.post('/tasks', authenticateToken, async (req, res) => {
    try {
        const taskData = { ...req.body, createdBy: req.user.userId };
        const task = await Task.create(taskData);
        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const updated = await Task.update(req.params.id, req.body);
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/tasks/:id', authenticateToken, async (req, res) => {
    try {
        await Task.delete(req.params.id);
        res.json({ success: true, message: 'Görev silindi' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update Task Order (Drag and Drop)
router.patch('/tasks/:id/move', authenticateToken, async (req, res) => {
    try {
        const { sectionId, order } = req.body;
        await Task.updateOrder(req.params.id, sectionId, order);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
