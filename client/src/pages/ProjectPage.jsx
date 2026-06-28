import {useNavigate, useParams} from 'react-router-dom'
import {useCallback, useEffect, useState} from "react";
import {fetchProjectStats} from "../api/apiClient.js";
import {useAuth} from "../hooks/useAuth.js";
import AddTasksForm from "../components/AddTasksForm.jsx";
import api from "../api/axiosClient.js";

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

    async function handleCreateTask(title, description, priority) {
        try{
            const response = await api.post(`/api/projects/${id}/tasks`,{title, description, priority});
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
