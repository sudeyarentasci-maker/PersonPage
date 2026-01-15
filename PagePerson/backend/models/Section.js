import { getDatabase } from '../config/database.js';
import { ObjectId } from 'mongodb';

class Section {
    static async create(sectionData) {
        const db = getDatabase();
        const sections = db.collection('sections');

        const newSection = {
            title: sectionData.title,
            order: sectionData.order || 0,
            projectId: sectionData.projectId ? new ObjectId(sectionData.projectId) : null, // Future proofing
            color: sectionData.color || '#F6F8F9', // Default column header color
            isSystem: sectionData.isSystem || false, // Prohibit deletion of system columns if needed
            createdAt: new Date()
        };

        const result = await sections.insertOne(newSection);
        return { ...newSection, _id: result.insertedId };
    }

    static async findAll() {
        const db = getDatabase();
        return await db.collection('sections')
            .find({})
            .sort({ order: 1 })
            .toArray();
    }

    static async update(id, updates) {
        const db = getDatabase();
        const result = await db.collection('sections').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updates },
            { returnDocument: 'after' }
        );
        return result;
    }

    static async delete(id) {
        const db = getDatabase();
        // Also delete tasks in this section? For now, prevent or orphan.
        // Let's delete tasks for safety in this rough implementation, or move them to backlog.
        // For now, simple delete.
        await db.collection('tasks').deleteMany({ sectionId: new ObjectId(id) });
        return await db.collection('sections').deleteOne({ _id: new ObjectId(id) });
    }

    static async seedDefaultSections() {
        const db = getDatabase();
        const count = await db.collection('sections').countDocuments();
        if (count === 0) {
            const defaults = [
                { title: 'Yapılacaklar', order: 0, color: '#FF5722' },
                { title: 'Sürüyor', order: 1, color: '#2196F3' },
                { title: 'İnceleme', order: 2, color: '#FFC107' },
                { title: 'Tamamlandı', order: 3, color: '#4CAF50' }
            ];
            await db.collection('sections').insertMany(defaults);
        }
    }
}

export default Section;
