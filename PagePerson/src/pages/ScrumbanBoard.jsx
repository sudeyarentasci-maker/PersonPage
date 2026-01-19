import React, { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';

import Column from '../components/Scrumban/Column';
import TaskCard from '../components/Scrumban/TaskCard';
import TaskModal from '../components/Scrumban/TaskModal';
import { getSections, moveTask, createTask, updateTask, deleteTask } from '../services/taskService';
import { useAuth } from '../auth/AuthContext';
import './ScrumbanBoard.css';

function ScrumbanBoard() {
    const { user } = useAuth();
    const [sections, setSections] = useState([]);
    const [activeId, setActiveId] = useState(null); // For drag overlay
    const [activeTask, setActiveTask] = useState(null); // For modal (edit mode)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const isManager = user?.primaryRole === 'MANAGER';

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Prevent accidental drags
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        fetchBoardData();
    }, []);

    const fetchBoardData = async () => {
        try {
            const result = await getSections();
            if (result.success) {
                setSections(result.data);
            }
        } catch (error) {
            console.error('Board data could not be loaded:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Drag and Drop Handlers ---

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Find source and destination containers
        const sourceSection = sections.find(section => section.tasks.some(task => task._id === activeId));
        const destSection = sections.find(section =>
            section._id === overId || section.tasks.some(task => task._id === overId)
        );

        if (!sourceSection || !destSection) return;

        // Optimistic UI Update
        const newSections = [...sections];
        const sourceSectionIndex = newSections.findIndex(s => s._id === sourceSection._id);
        const destSectionIndex = newSections.findIndex(s => s._id === destSection._id);

        const taskIndex = newSections[sourceSectionIndex].tasks.findIndex(t => t._id === activeId);
        const [movedTask] = newSections[sourceSectionIndex].tasks.splice(taskIndex, 1);

        // Update task's sectionId locally
        movedTask.sectionId = destSection._id;

        // Calculate new index
        let newIndex = 0;
        if (destSection._id === overId) {
            // Dropped on the column itself -> append to end
            newIndex = newSections[destSectionIndex].tasks.length;
        } else {
            // Dropped on a task -> insert before/after
            const overTaskIndex = newSections[destSectionIndex].tasks.findIndex(t => t._id === overId);
            const isBelow = active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
            const modifier = isBelow ? 1 : 0;
            newIndex = overTaskIndex >= 0 ? overTaskIndex + modifier : newSections[destSectionIndex].tasks.length;
        }

        newSections[destSectionIndex].tasks.splice(newIndex, 0, movedTask);
        setSections(newSections);

        // API Call
        try {
            await moveTask(activeId, destSection._id, newIndex);
        } catch (error) {
            console.error('Move failed:', error);
            fetchBoardData(); // Revert on error
        }
    };

    // --- Task Actions ---

    const handleAddTask = (sectionId = null) => {
        setActiveTask(sectionId ? { sectionId } : null); // Pre-select section if clicked from header
        setIsModalOpen(true);
    };

    const handleEditTask = (task) => {
        setActiveTask(task);
        setIsModalOpen(true);
    };

    const handleSaveTask = async (taskData) => {
        try {
            if (taskData._id) {
                await updateTask(taskData._id, taskData);
            } else {
                // Default to first section if none selected
                if (!taskData.sectionId && sections.length > 0) {
                    taskData.sectionId = sections[0]._id;
                }
                await createTask(taskData);
            }
            fetchBoardData(); // Refresh board
            setIsModalOpen(false);
            setActiveTask(null);
        } catch (error) {
            console.error('Save failed:', error);
            alert('Kaydedilemedi');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Bu görevi silmek istiyor musunuz?')) return;
        try {
            await deleteTask(taskId);
            fetchBoardData();
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    if (isLoading) return <div className="loading">Yükleniyor...</div>;

    // Helper to find task usage for DragOverlay
    const findTask = (id) => {
        for (const section of sections) {
            const task = section.tasks.find(t => t._id === id);
            if (task) return task;
        }
        return null;
    };

    const activeTaskOverlay = activeId ? findTask(activeId) : null;

    return (
        <div className="scrumban-container">
            <div className="board-header">
                <div className="board-title">
                    <h1>Sprints / Agile Board</h1>
                    {!isManager && <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>📖 Sadece Görüntüleme Modu</p>}
                </div>
                <div className="board-actions">
                    {isManager && (
                        <button className="add-task-btn" onClick={() => handleAddTask()}>
                            <span>+</span> Görev Ekle
                        </button>
                    )}
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="board-columns">
                    {sections.map(section => (
                        <Column
                            key={section._id}
                            section={section}
                            tasks={section.tasks}
                            onAddTask={() => handleAddTask(section._id)}
                            onEditTask={handleEditTask}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeTaskOverlay ? (
                        <TaskCard task={activeTaskOverlay} isOverlay />
                    ) : null}
                </DragOverlay>
            </DndContext>

            {isModalOpen && (
                <TaskModal
                    task={activeTask}
                    sections={sections}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveTask}
                    onDelete={handleDeleteTask}
                />
            )}
        </div>
    );
}

export default ScrumbanBoard;
