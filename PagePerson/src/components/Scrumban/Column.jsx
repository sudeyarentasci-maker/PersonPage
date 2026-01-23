import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

function Column({ section, tasks, onAddTask, onEditTask, readOnly }) {
    const { setNodeRef } = useDroppable({
        id: section._id,
    });

    const getColumnClass = (title) => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('yapılacak')) return 'column-todo';
        if (lowerTitle.includes('sürüyor')) return 'column-progress';
        if (lowerTitle.includes('inceleme')) return 'column-review';
        if (lowerTitle.includes('tamamlandı')) return 'column-done';
        return '';
    };

    return (
        <div className={`board-column ${getColumnClass(section.title)}`}>
            <div className="column-header">
                <div className="column-title">
                    {section.title}
                    <span className="task-count">{tasks.length}</span>
                </div>
                <div className="column-actions">
                    {!readOnly && <button onClick={onAddTask} title="Görev Ekle">+</button>}
                    <button title="Ayarlar">•••</button>
                </div>
            </div>

            <SortableContext
                id={section._id}
                items={tasks.map(t => t._id)}
                strategy={verticalListSortingStrategy}
            >
                <div ref={setNodeRef} className="task-list">
                    {tasks.map(task => (
                        <TaskCard
                            key={task._id}
                            task={task}
                            onClick={() => onEditTask(task)}
                            readOnly={readOnly}
                        />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}

export default Column;
