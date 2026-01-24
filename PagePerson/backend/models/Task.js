import { getDatabase } from '../config/database.js';
import { ObjectId } from 'mongodb';

class Task {
    static async create(taskData) {
        console.log('Task.create called with:', taskData);
        try {
            const db = getDatabase();
            const tasks = db.collection('tasks');

            console.log('Converting IDs...');
            let sectionId;
            let assigneeId = taskData.assigneeId || null;
            let createdBy = taskData.createdBy;

            // sectionId IS an ObjectId (from MongoDB)
            try {
                sectionId = new ObjectId(taskData.sectionId);
            } catch (err) {
                throw new Error('Invalid Section ID format');
            }

            // createdBy and assigneeId are custom string IDs (e.g. "HR001"), NOT ObjectIds in this system

            console.log('IDs processed:', { sectionId, assigneeId, createdBy });

            const newTask = {
                title: taskData.title,
                description: taskData.description || '',
                sectionId: sectionId,
                assigneeId: assigneeId,
                assignedTo: taskData.assignedTo || null, // Employee userId assigned to this task
                assignedBy: createdBy, // Manager userId who assigned the task
                priority: taskData.priority || 'medium',
                dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
                tags: taskData.tags || [],
                order: taskData.order || 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: createdBy
            };

            const result = await tasks.insertOne(newTask);
            console.log('Insert result:', result);
            return { ...newTask, _id: result.insertedId };
        } catch (error) {
            console.error('Error in Task.create:', error);
            throw error;
        }
    }

    static async findBySection(sectionId) {
        const db = getDatabase();
        return await db.collection('tasks')
            .find({ sectionId: new ObjectId(sectionId) })
            .sort({ order: 1 })
            .toArray();
    }

    static async findAll(filter = {}) {
        const db = getDatabase();
        const query = {};
        if (filter.sectionId) query.sectionId = new ObjectId(filter.sectionId);
        if (filter.assigneeId) query.assigneeId = filter.assigneeId; // Keep as string

        return await db.collection('tasks')
            .find(query)
            .sort({ order: 1 })
            .toArray();
    }

    static async update(id, updates) {
        const db = getDatabase();

        // Remove _id from updates if it exists (MongoDB doesn't allow updating _id)
        if (updates._id) delete updates._id;

        if (updates.sectionId) {
            try {
                updates.sectionId = new ObjectId(updates.sectionId);
            } catch (e) {
                // Check if it's already an ObjectId? Or just ignore invalid format?
                // If it's invalid, it might be better to throw or not update it.
                // For now, let's assume if it fails, we keep the original string or fail.
                // But the previous create logic suggests we need to be careful.
                // Assuming frontend sends valid ID for sections.
                // If sectionId is invalid, new ObjectId throws.
                console.error("Invalid Section ID in update:", updates.sectionId);
                delete updates.sectionId; // Don't update if invalid
            }
        }

        // assigneeId stays as string
        if (updates.dueDate) updates.dueDate = new Date(updates.dueDate);

        updates.updatedAt = new Date();

        const result = await db.collection('tasks').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updates },
            { returnDocument: 'after' }
        );
        return result;
    }

    static async updateOrder(id, newSectionId, newOrder) {
        const db = getDatabase();
        const tasks = db.collection('tasks');

        // Updates task's position and potentially column
        await tasks.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    sectionId: new ObjectId(newSectionId),
                    order: newOrder,
                    updatedAt: new Date()
                }
            }
        );
    }

    static async delete(id) {
        const db = getDatabase();
        return await db.collection('tasks').deleteOne({ _id: new ObjectId(id) });
    }

    // Find tasks assigned to a specific employee
    static async findByAssignee(userId) {
        const db = getDatabase();
        return await db.collection('tasks')
            .find({ assignedTo: userId })
            .sort({ order: 1 })
            .toArray();
    }

    // Count pending (not completed) tasks for an employee
    static async countPendingByAssignee(userId) {
        const db = getDatabase();
        const sections = await db.collection('sections').find().toArray();

        // Find the "Tamamlandı" section ID
        const completedSection = sections.find(s =>
            s.title.toLowerCase().includes('tamamlan')
        );

        const query = { assignedTo: userId };

        // Exclude completed tasks
        if (completedSection) {
            query.sectionId = { $ne: completedSection._id };
        }

        return await db.collection('tasks').countDocuments(query);
    }

    // Kullanıcıya atanan YENİ görevleri say (Yapılacaklar sütunundaki)
    static async countNewAssignments(userId) {
        const db = getDatabase();
        // "Yapılacaklar" sütununu bul
        const todoSection = await db.collection('sections').findOne({
            title: { $regex: /yapılacaklar/i }
        });

        if (!todoSection) return 0;

        return await db.collection('tasks').countDocuments({
            assignedTo: userId,
            sectionId: todoSection._id
        });
    }

    // Bir kullanıcıya atanmış tüm görevlerin atamasını kaldır (Manager değişikliğinde)
    static async unassignAllFromUser(userId) {
        const db = getDatabase();

        // Sadece tamamlanmamış görevleri etkilemeliyiz
        // "Tamamlandı" bölümünü bul
        const completedSection = await db.collection('sections').findOne({
            title: { $regex: /tamamland/i }
        });

        const query = { assignedTo: userId };
        if (completedSection) {
            query.sectionId = { $ne: completedSection._id };
        }

        const result = await db.collection('tasks').updateMany(
            query,
            {
                $set: {
                    assignedTo: null,
                    updatedAt: new Date()
                }
            }
        );

        console.log(`Unassigned ${result.modifiedCount} tasks from user ${userId}`);
        return result;
    }
}

export default Task;

