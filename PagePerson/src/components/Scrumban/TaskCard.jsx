import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function TaskCard({ task, onClick, isOverlay, readOnly }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task._id, disabled: readOnly });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // Format Date
    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    };

    // Determine priority badge color
    const getPriorityClass = (p) => {
        switch (p) {
            case 'high': return 'tag-high';
            case 'medium': return 'tag-medium';
            case 'low': return 'tag-low';
            default: return 'tag-medium';
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`task-card ${isOverlay ? 'dragging' : ''}`}
            onClick={() => {
                // Prevent click when dragging ends
                if (!isDragging) onClick();
            }}
        >
            <div className="task-card-header">
                <div className="task-tags">
                    <span className={`task-tag ${getPriorityClass(task.priority)}`}>
                        {task.priority === 'high' ? 'Yüksek' : task.priority === 'low' ? 'Düşük' : 'Orta'}
                    </span>
                    {task.tags && task.tags.map(tag => (
                        <span key={tag} className="task-tag tag-dev">{tag}</span>
                    ))}
                </div>
                {!readOnly && <button className="task-options-btn">•••</button>}
            </div>

            <div className="task-title">{task.title}</div>

            <div className="task-footer">
                <div className="task-meta">
                    {task.dueDate && (
                        <div className={`meta-item meta-due-date ${new Date(task.dueDate) < new Date() ? 'overdue' : ''}`}>
                            📅 {formatDate(task.dueDate)}
                        </div>
                    )}
                    {task.subtasks && task.subtasks.length > 0 && (
                        <div className="meta-item">
                            ✅ {task.subtasks.filter(t => t.done).length}/{task.subtasks.length}
                        </div>
                    )}
                </div>

                <div className="task-assignee-container">
                    {task.assignedTo && (
                        <span className="task-assignee-name">
                            {task.assignedToName || task.assignedToEmail || task.assignedTo}
                        </span>
                    )}
                    <div className="task-assignee" title="Atanan Kişi">
                        👤
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskCard;
