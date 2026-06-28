import {useNavigate, useParams} from 'react-router-dom'
import {useCallback, useEffect, useState} from "react";
import {apiFetch, fetchProjectStats} from "../api/apiClient.js";
import {useAuth} from "../hooks/useAuth.js";
import AddTasksForm from "../components/AddTasksForm.jsx";

const ProjectPage = () => {
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const {id} = useParams();
    const {logout, accessToken, refreshToken, updateTokens} = useAuth();
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
        const response = await apiFetch(`http://localhost:5000/api/tasks/${taskId}/attachments`, {
            method: 'GET',},
            accessToken,
            refreshToken,
            updateTokens,
            logout)
        const data = await response.json();
        if(!response.ok) {
            setError('Ошибка загрузки данных');
            setLoading(false);
            return;
        }
        setAttachments(prev => ({...prev, [taskId]: data.attachments}));
    }

    const fetchTasks = useCallback(async (search, filterStatus, filterPriority, page) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', 10);
        if(search) params.append('search', search);
        if(filterStatus) params.append('status', filterStatus);
        if (filterPriority) params.append('priority', filterPriority);
        const url = `http://localhost:5000/api/projects/${id}/tasks?${params.toString()}`;

        const [projectResponse, tasksResponse, statsResponse] = await Promise.all([
            apiFetch(`http://localhost:5000/api/projects/${id}`,
                {method: 'GET'},
                accessToken,
                refreshToken,
                updateTokens,
                logout
            ),
            apiFetch(url,
                {method: 'GET'},
                accessToken,
                refreshToken,
                updateTokens,
                logout
            ),
            apiFetch(`http://localhost:5000/api/projects/${id}/stats`,
                {method: 'GET'},
                accessToken,
                refreshToken,
                updateTokens,
                logout)
        ]);
        const projectData = await projectResponse.json();
        const tasksData = await tasksResponse.json();
        const statsData = await statsResponse.json();
        if (!projectResponse.ok || !tasksResponse.ok || !statsResponse.ok) {
            setError('Ошибка загрузки данных');
            setLoading(false);
            return;
        }
        setProject(projectData.project);
        setTasks(tasksData.tasks);
        setLoading(false);
        setStats(statsData.stats);
        setTotalPages(tasksData.totalPages);
    }, [id, accessToken, refreshToken]);

    useEffect(() => {
        fetchTasks(search, filterStatus, filterPriority, page);
    }, [fetchTasks, search, filterStatus, filterPriority, page]);

    async function handleCreateTask(title, description, priority) {
        const response = await apiFetch(`http://localhost:5000/api/projects/${id}/tasks`,
            {method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, priority })},
            accessToken,
            refreshToken,
            updateTokens,
            logout
        )
        const data = await response.json();
        if(!response.ok) {
            setError(data.message);
            setLoading(false);
            setShowForm(false);
            return;
        }
        setShowForm(false);
        setTasks(tasks => [...tasks, data.task]);
        const statsData = await fetchProjectStats(id, accessToken, refreshToken, updateTokens, logout);
        setStats(statsData.stats);
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
        const response = await apiFetch(`http://localhost:5000/api/tasks/${taskId}/attachments`,{
            method: 'POST',
            body: formData
            },
            accessToken,
            refreshToken,
            updateTokens,
            logout)
        const data = await response.json();
        if(!response.ok) {
            setError(data.message);
            setLoading(false);
            return;
        }
        await fetchAttachments(taskId);
    }

    async function handleDeleteTask(removedId) {
        if(window.confirm('Точно хочешь удалить задачу?')) {
            const response = await apiFetch(
                `http://localhost:5000/api/tasks/${removedId}`,
                { method: "DELETE" },
                accessToken,
                refreshToken,
                updateTokens,
                logout
            );
            const data = await response.json();
            if(!response.ok) {
                setError(data.message);
                return;
            }
            setTasks(tasks => tasks.filter(task => task.id !== removedId));
            const statsData = await fetchProjectStats(id, accessToken, refreshToken, updateTokens, logout);
            setStats(statsData.stats);
        }
    }

    async function handleUpdateTask(updatedId, status) {
        const currentTask = tasks.find((task) => task.id === updatedId);
        const title = currentTask.title;
        const description = currentTask.description;
        const priority = currentTask.priority;
        const deadline = currentTask.deadline;
        const response = await apiFetch(`http://localhost:5000/api/tasks/${updatedId}`,
            {method: 'PUT',
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify({title, description, priority, status, deadline}),},
            accessToken,
            refreshToken,
            updateTokens,
            logout
        );
        const data = await response.json();
        if(!response.ok) {
            setError(data.message);
            return;
        }
       const updatedTasks = tasks.map((task) => {
            if(task.id === updatedId) {
                return data.task;
            }
            return task;
        })
        setTasks(updatedTasks);
        const statsData = await fetchProjectStats(id, accessToken, refreshToken, updateTokens, logout);
        setStats(statsData.stats);
    }

    if(loading){
        return <p>Загрузка...</p>
    }

    return (
        <>
            <div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <h1>{project.title}</h1>
                <p>{project.description}</p>
                <p>Задач всего: {stats.total} Выполнено: {stats.completed}</p>
                <input
                    type="text"
                    placeholder="Поиск по задачам"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
                <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
                    <option value="">Все статусы</option>
                    <option value="todo">todo</option>
                    <option value="inProgress">in progress</option>
                    <option value="done">done</option>
                </select>

                <select value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}>
                    <option value="">Все приоритеты</option>
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                </select>
                {tasks.map(task => (
                    <div key = {task.id}>
                        <div onClick={()=> handleTaskClick(task.id)}>
                            <p>{task.title}: {task.priority}</p>
                            <select onChange={(e) => handleUpdateTask(task.id, e.target.value)} onClick={(e) => e.stopPropagation()}>
                                <option value="todo">todo</option>
                                <option value="inProgress">in progress</option>
                                <option value="done">done</option>
                            </select>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}>❌</button>
                        </div>
                        <div>
                        {expandedTaskId === task.id &&
                            <div>
                                {(attachments[task.id] || []).map(attachment => (
                                    <div key={attachment.id}>
                                        <p>{attachment.original_name}</p>
                                    </div>
                                ))}
                                <input type="file" onChange={(e) => handleUploadFile(task.id, e.target.files[0])} />
                            </div>

                        }
                        </div>
                    </div>
                ))}
            </div>
                <button onClick={()=> setShowForm(true)}>Добавить задачу</button>
                <button onClick={() => navigate('/')}>Назад</button>
            <div>
                {showForm && <AddTasksForm addTask = {handleCreateTask} showForm={true}/>}
                {showForm && <button onClick={() => setShowForm(false)}>Отмена</button>}
            </div>
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>Назад</button>
            <span>{page} / {totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Вперёд</button>
        </>
    );
};

export default ProjectPage;
