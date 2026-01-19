import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Task from '../models/Task.js';
import Section from '../models/Section.js';
import { getDatabase } from '../config/database.js';

const router = express.Router();

// --- SECTIONS ---

// Get all sections (and optionally tasks nested)
router.get('/sections', authenticateToken, async (req, res) => {
    try {
        await Section.seedDefaultSections(); // Ensure defaults exist
        const sections = await Section.findAll();

        // Fetch tasks for each section based on user role
        const sectionsWithTasks = await Promise.all(sections.map(async (section) => {
            let tasks = await Task.findBySection(section._id);

            // If user is Employee, only show tasks assigned to them
            if (req.user.role === 'EMPLOYEE') {
                tasks = tasks.filter(task => task.assignedTo === req.user.userId);
            }
            // Managers see all tasks

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

// Get employees managed by the current manager
router.get('/my-employees', authenticateToken, async (req, res) => {
    try {
        // Only managers can access this endpoint
        if (req.user.role !== 'MANAGER') {
            return res.status(403).json({ success: false, message: 'Yalnızca manager\'lar erişebilir' });
        }

        const db = getDatabase();

        // Get employees managed by this manager
        const managedRelations = await db.collection('employee_manager')
            .find({ managerId: req.user.userId })
            .toArray();

        const employeeIds = managedRelations.map(rel => rel.employeeId);

        // Get employee details
        const employees = await db.collection('users')
            .find({ userId: { $in: employeeIds } })
            .project({ userId: 1, email: 1, firstName: 1, lastName: 1 })
            .toArray();

        res.json({ success: true, data: employees });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get count of pending tasks assigned to current user
router.get('/assigned-count', authenticateToken, async (req, res) => {
    try {
        const count = await Task.countPendingByAssignee(req.user.userId);
        res.json({ success: true, data: { count } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/tasks', authenticateToken, async (req, res) => {
    try {
        // Only managers can create tasks
        if (req.user.role !== 'MANAGER') {
            return res.status(403).json({ success: false, message: 'Yalnızca manager\'lar görev oluşturabilir' });
        }

        // Validate that assignedTo is provided
        if (!req.body.assignedTo) {
            return res.status(400).json({ success: false, message: 'Görev bir çalışana atanmalıdır' });
        }

        const taskData = { ...req.body, createdBy: req.user.userId };
        const task = await Task.create(taskData);
        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/tasks/:id', authenticateToken, async (req, res) => {
    try {
        // Only managers can update tasks
        if (req.user.role !== 'MANAGER') {
            return res.status(403).json({ success: false, message: 'Yalnızca manager\'lar görev düzenleyebilir' });
        }

        const updated = await Task.update(req.params.id, req.body);
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/tasks/:id', authenticateToken, async (req, res) => {
    try {
        // Only managers can delete tasks
        if (req.user.role !== 'MANAGER') {
            return res.status(403).json({ success: false, message: 'Yalnızca manager\'lar görev silebilir' });
        }

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
