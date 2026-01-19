import React, { useState, useEffect } from 'react';
import { getManagedEmployees } from '../../services/taskAssignmentService';
import { useAuth } from '../../auth/AuthContext';

function TaskModal({ task, sections, onClose, onSave, onDelete }) {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        sectionId: sections.length > 0 ? sections[0]._id : '',
        tags: '',
        assignedTo: ''
    });

    useEffect(() => {
        // Fetch managed employees if user is a manager
        if (user?.primaryRole === 'MANAGER') {
            fetchEmployees();
        }

        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'medium',
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                sectionId: task.sectionId || '',
                tags: task.tags ? task.tags.join(', ') : '',
                assignedTo: task.assignedTo || '',
                _id: task._id
            });
        } else if (sections.length > 0 && !formData.sectionId) {
            // Set default section for new task
            setFormData(prev => ({ ...prev, sectionId: sections[0]._id }));
        }
    }, [task, sections, user]);

    const fetchEmployees = async () => {
        try {
            console.log('Fetching managed employees...');
            const result = await getManagedEmployees();
            console.log('Employee fetch result:', result);
            if (result.success) {
                console.log('Employees loaded:', result.data);
                setEmployees(result.data);
            } else {
                console.error('Failed to fetch employees:', result);
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        }
    };

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
                            <label>📝 Görev Adı *</label>
                            <input
                                name="title"
                                className="form-input"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Göreviniz için açıklayıcı bir başlık girin..."
                                required
                                autoFocus
                            />
                        </div>

                        {/* Assignee Selection - Only for Managers */}
                        {user?.primaryRole === 'MANAGER' && (
                            <div className="form-group">
                                <label>👤 Atanan Kişi *</label>
                                <select
                                    name="assignedTo"
                                    className="form-input"
                                    value={formData.assignedTo}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Bir çalışan seçin...</option>
                                    {employees.map(emp => (
                                        <option key={emp.userId} value={emp.userId}>
                                            {emp.firstName && emp.lastName
                                                ? `${emp.firstName} ${emp.lastName} (${emp.email})`
                                                : emp.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="form-row">
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>📋 Durum / Bölüm</label>
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
                                <label>⚡ Öncelik</label>
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
                            <label>📄 Açıklama</label>
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
                                <label>📅 Son Tarih</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    className="form-input"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>🏷️ Etiketler</label>
                                <input
                                    name="tags"
                                    className="form-input"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="Örn: Dev, Bug, UI, Feature (virgülle ayırın)"
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
