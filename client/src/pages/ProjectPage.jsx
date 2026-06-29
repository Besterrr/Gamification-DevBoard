import {useNavigate, useParams} from 'react-router-dom'
import {useCallback, useEffect, useState} from "react";
import {fetchProjectStats} from "../api/apiClient.js";
import {useAuth} from "../hooks/useAuth.js";
import AddTasksForm from "../components/AddTasksForm.jsx";
import Dropdown from "../components/Dropdown.jsx";
import api from "../api/axiosClient.js";
import {priorityLabels, priorityOptions, statusOptions} from "../constants/taskConstants.js";
import './ProjectPage.scss';
import Loader from "../components/Loader.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const statusFilterOptions = statusOptions;
const priorityFilterOptions = priorityOptions;
const taskStatusOptions = statusOptions;

function getDeadlineUrgency(deadline, status) {
    if (!deadline) return null;
    if (status === 'done') return 'done';

    const diffMs = new Date(deadline).getTime() - Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (diffMs < 0) return 'overdue';
    if (diffMs <= oneDayMs) return 'soon';
    return 'ok';
}

function formatDeadline(deadline) {
    return new Date(deadline).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const ProjectPage = () => {
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const {id} = useParams();
    const {logout} = useAuth();
    const [project, setProject] = useState(null)
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(0);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterPriority, setFilterPriority] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [expandedTaskId, setExpandedTaskId] = useState(null);
    const [attachments, setAttachments] = useState({[id]: []});

    async function fetchAttachments(taskId) {
        try{
            const response = await api.get(`/api/tasks/${taskId}/attachments`)
            setAttachments(prev => ({...prev, [taskId]: response.data.attachments}));
        }catch (e) {
            setError(e.message);
            setLoading(false);
        }
    }

    const fetchTasks = useCallback(async (search, filterStatus, filterPriority, page) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', 10);
        if(search) params.append('search', search);
        if(filterStatus) params.append('status', filterStatus);
        if (filterPriority) params.append('priority', filterPriority);
        const url = `/api/projects/${id}/tasks?${params.toString()}`;
        try{
            const [projectResponse, tasksResponse, statsResponse] = await Promise.all([
                api.get(`/api/projects/${id}`),
                api.get(url),
                api.get(`/api/projects/${id}/stats`)
            ]);
            setProject(projectResponse.data.project);
            setTasks(tasksResponse.data.tasks);
            setTotalPages(tasksResponse.data.totalPages);
            setStats(statsResponse.data.stats);
            setLoading(false);
        }catch (e) {
            setError(e.message);
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchTasks(search, filterStatus, filterPriority, page);
    }, [fetchTasks, search, filterStatus, filterPriority, page]);

    async function handleCreateTask(title, description, priority, deadline) {
        try{
            const response = await api.post(`/api/projects/${id}/tasks`,{title, description, priority, deadline});
            setShowForm(false)
            setTasks(tasks => [...tasks, response.data.task]);
            const statsData = await fetchProjectStats(id)
            setStats(statsData.stats);
            setShowForm(false);
        }catch (e) {
            setError(e.message);
            setLoading(false);
        }
    }

    async function handleTaskClick(taskId){
        if(expandedTaskId === taskId){
            setExpandedTaskId(null);
            return
        }
        setExpandedTaskId(taskId);
        await fetchAttachments(taskId);
    }

    async function handleUploadFile(taskId, file){
        const formData = new FormData();
        formData.append('file', file);
        try{
            await api.post(`/api/tasks/${taskId}/attachments`, formData)
            await fetchAttachments(taskId);
        }catch (e) {
            setError(e.message);
            setLoading(false);
        }
    }

    async function handleDeleteTask(removedId) {
        if(window.confirm('Точно хочешь удалить задачу?')) {
            try{
                await api.delete(`/api/tasks/${removedId}`);
                setTasks(tasks => tasks.filter(task => task.id !== removedId));
                const statsData = await fetchProjectStats(id,logout);
                setStats(statsData.stats);
            }catch (e) {
                setError(e.message);
                setLoading(false);
            }
        }
    }

    async function handleUpdateTask(updatedId, status) {
        try{
            const currentTask = tasks.find((task) => task.id === updatedId);
            const title = currentTask.title;
            const description = currentTask.description;
            const priority = currentTask.priority;
            const deadline = currentTask.deadline;
            const response = await api.put(`/api/tasks/${updatedId}`, {title, description, priority, status, deadline})
            const updatedTasks = tasks.map((task) => {
                if(task.id === updatedId) {
                    return response.data.task;
                }
                return task;
            })
            setTasks(updatedTasks);
            const statsData = await fetchProjectStats(id,logout);
            setStats(statsData.stats);
        }catch (e) {
            setError(e.message);
            setLoading(false);
        }
    }

    if (loading) return <Loader fullscreen />;
    const total = Number(stats.total) || 0;
    const completed = Number(stats.completed) || 0;
    const progressPercent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
        <div className="project-page">
            <header className="project-page__header">
                <button className="project-page__back" onClick={() => navigate('/')}>← Назад</button>
                <div className="project-page__heading">
                    <h1>{project.title}</h1>
                    {project.description && <p className="project-page__description">{project.description}</p>}
                </div>

                <div className="project-page__progress">
                    <div className="project-page__progress-labels">
                        <span>Выполнено {completed} из {total}</span>
                        <span>{progressPercent}%</span>
                    </div>
                    <div className="project-page__progress-bar">
                        <div className="project-page__progress-fill" style={{width: `${progressPercent}%`}}/>
                    </div>
                </div>
            </header>

            {error && <p className="project-page__error">{error}</p>}

            <div className="project-page__toolbar">
                <input
                    className="project-page__search"
                    type="text"
                    placeholder="Поиск по задачам"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
                <Dropdown
                    value={filterStatus}
                    options={statusFilterOptions}
                    placeholder="Все статусы"
                    onChange={(val) => { setFilterStatus(val); setPage(1); }}
                />
                <Dropdown
                    value={filterPriority}
                    options={priorityFilterOptions}
                    placeholder="Все приоритеты"
                    onChange={(val) => { setFilterPriority(val); setPage(1); }}
                />
                {(search || filterStatus || filterPriority) &&
                    <button
                        className="project-page__reset-filters"
                        onClick={() => { setSearch(''); setFilterStatus(''); setFilterPriority(''); setPage(1); }}
                        aria-label="Сбросить фильтры"
                        title="Сбросить фильтры"
                    >
                        ✕
                    </button>
                }
                <button className="project-page__add-btn" onClick={() => setShowForm(true)}>+ Новая задача</button>
            </div>

            {tasks.length === 0
                ? <p className="project-page__empty">Задач пока нет — добавь первую</p>
                : <ul className="task-list">
                    {tasks.map(task => {
                        const urgency = getDeadlineUrgency(task.deadline, task.status);
                        return (
                            <li key={task.id} className={`task-card ${task.status === 'done' ? 'task-card--done' : ''}`}>
                                <div className="task-card__row" onClick={() => handleTaskClick(task.id)}>
                                    <div className="task-card__main">
                                        <span className={`task-card__priority task-card__priority--${task.priority}`}>
                                            {priorityLabels[task.priority] || task.priority}
                                        </span>
                                        <span className="task-card__title">{task.title}</span>
                                        {task.deadline &&
                                            <span className={`task-card__deadline task-card__deadline--${urgency}`}>
                                                🕒 {formatDeadline(task.deadline)}
                                            </span>
                                        }
                                    </div>

                                    <div className="task-card__controls" onClick={(e) => e.stopPropagation()}>
                                        <Dropdown
                                            value={task.status}
                                            options={taskStatusOptions}
                                            onChange={(val) => handleUpdateTask(task.id, val)}
                                            colorByValue
                                        />
                                        <button
                                            className="task-card__delete"
                                            onClick={() => handleDeleteTask(task.id)}
                                            aria-label="Удалить задачу"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                {expandedTaskId === task.id &&
                                    <div className="task-card__attachments">
                                        {(attachments[task.id] || []).length === 0
                                            ? <p className="task-card__no-files">Файлов пока нет</p>
                                            : (attachments[task.id] || []).map(attachment => (
                                                <div key={attachment.id} className="task-card__file">
                                                    📎 {attachment.original_name}
                                                </div>
                                            ))
                                        }
                                        <label className="task-card__upload">
                                            Прикрепить файл
                                            <input type="file" onChange={(e) => handleUploadFile(task.id, e.target.files[0])} />
                                        </label>
                                    </div>
                                }
                            </li>
                        );
                    })}
                </ul>
            }

            <div className="project-page__pagination">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Назад</button>
                <span>{page} / {totalPages}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Вперёд →</button>
            </div>

            {showForm &&
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h2>Новая задача</h2>
                            <button className="modal__close" onClick={() => setShowForm(false)} aria-label="Закрыть">✕</button>
                        </div>
                        <AddTasksForm addTask={handleCreateTask} showForm={true}/>
                    </div>
                </div>
            }
            <ThemeToggle />
        </div>
    );
};

export default ProjectPage;