// BACKEND ENDPOINTS FOR MANAGER MANAGEMENT
// Add these to backend/routes/users.js after the existing routes

/**
 * GET /api/users/managers
 * Get list of all managers for selection
 */
router.get('/managers', authenticateToken, authorizeRoles('HR'), async (req, res) => {
    try {
        const db = getDatabase();

        // Find all users who have MANAGER role
        const managerRole = await db.collection('roles').findOne({ name: 'MANAGER' });

        if (!managerRole) {
            return res.json({ success: true, data: { managers: [] } });
        }

        const managerUserRoles = await db.collection('user_roles')
            .find({ roleId: managerRole._id })
            .toArray();

        const managerUserIds = managerUserRoles.map(ur => ur.userId);

        const managers = await db.collection('users')
            .find({ userId: { $in: managerUserIds } })
            .project({ userId: 1, email: 1, firstName: 1, lastName: 1 })
            .toArray();

        res.json({ success: true, data: { managers } });
    } catch (error) {
        console.error('Manager listesi hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Manager listesi alınamadı.'
        });
    }
});

/**
 * PUT /api/users/:userId/manager
 * Change employee's manager
 */
router.put('/:userId/manager', authenticateToken, authorizeRoles('HR'), async (req, res) => {
    try {
        const { userId } = req.params;
        const { managerId } = req.body;

        const db = getDatabase();

        // Remove existing manager relationship
        await db.collection('employee_manager').deleteMany({ employeeId: userId });

        // If managerId is not REMOVE, create new relationship
        if (managerId && managerId !== 'REMOVE') {
            await db.collection('employee_manager').insertOne({
                employeeId: userId,
                managerId: managerId,
                assignedAt: new Date()
            });
        }

        // Log the action
        await logUserAction(
            'Manager değiştirildi',
            {
                userId: req.user.userId,
                userName: req.user.email,
                userEmail: req.user.email
            },
            { email: 'N/A' },
            `Kullanıcı: ${userId}, Yeni Manager: ${managerId || 'Kaldırıldı'}`
        );

        res.json({
            success: true,
            message: managerId && managerId !== 'REMOVE'
                ? 'Manager başarıyla değiştirildi.'
                : 'Manager ataması kaldırıldı.'
        });

    } catch (error) {
        console.error('Manager değiştirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Manager değiştirilemedi.'
        });
    }
});
