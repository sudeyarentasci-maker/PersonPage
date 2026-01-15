import React, { useState, useEffect } from 'react';

function TaskModal({ task, sections, onClose, onSave, onDelete }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        sectionId: sections.length > 0 ? sections[0]._id : '',
        tags: ''
    });

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'medium',
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                sectionId: task.sectionId || '',
                tags: task.tags ? task.tags.join(', ') : '',
                _id: task._id
            });
        } else if (sections.length > 0 && !formData.sectionId) {
            // Set default section for new task
            setFormData(prev => ({ ...prev, sectionId: sections[0]._id }));
        }
    }, [task, sections]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Convert tags string to array
        const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);

        onSave({
            ...formData,
            tags: tagsArray
        });
    };

    return (
        <div className="scrumban-modal-overlay" onClick={onClose}>
            <div className="scrumban-task-modal" onClick={e => e.stopPropagation()}>
                <div className="scrumban-modal-header">
                    <h2>{task ? 'Görevi Düzenle' : 'Yeni Görev'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="scrumban-modal-content">
                        <div className="form-group">
                            <label>Görev Adı</label>
                            <input
                                name="title"
                                className="form-input"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Örn: Tasarımı Tamamla"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Durum / Bölüm</label>
                                <select
                                    name="sectionId"
                                    className="form-input"
                                    value={formData.sectionId}
                                    onChange={handleChange}
                                >
                                    {sections.map(section => (
                                        <option key={section._id} value={section._id}>
                                            {section.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Öncelik</label>
                                <select
                                    name="priority"
                                    className="form-input"
                                    value={formData.priority}
                                    onChange={handleChange}
                                >
                                    <option value="low">Düşük</option>
                                    <option value="medium">Orta</option>
                                    <option value="high">Yüksek</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Açıklama</label>
                            <textarea
                                name="description"
                                className="form-input"
                                rows="4"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Detaylı açıklama ekleyin..."
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Son Tarih</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    className="form-input"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Etiketler (virgül ile ayırın)</label>
                                <input
                                    name="tags"
                                    className="form-input"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="Dev, Bug, UI..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="scrumban-modal-footer">
                        {task && (
                            <button
                                type="button"
                                className="btn-cancel"
                                style={{ color: '#dc2626', borderColor: '#fee2e2', marginRight: 'auto' }}
                                onClick={() => onDelete(task._id)}
                            >
                                Sil
                            </button>
                        )}
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            İptal
                        </button>
                        <button type="submit" className="btn-primary">
                            Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TaskModal;
