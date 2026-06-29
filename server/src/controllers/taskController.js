const pool = require('../config/db');
const {checkAndAwardAchievements} = require('../services/achievementService')

async function getTasks(req, res){
    try{
        const project_id = req.params.projectId;
        const { search, status, priority } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const conditions = ['project_id = $1'];
        const params = [project_id];

        if (search) {
            params.push(`%${search}%`);
            conditions.push(`title ILIKE $${params.length}`);
        }
        if (status) {
            params.push(status);
            conditions.push(`status = $${params.length}`);
        }
        if (priority) {
            params.push(priority);
            conditions.push(`priority = $${params.length}`);
        }

        const where = conditions.join(' AND ');

        const countResult = await pool.query(
            `SELECT COUNT(*) FROM tasks WHERE ${where}`,
            params
        );
        const total = parseInt(countResult.rows[0].count);

        const tasksResult = await pool.query(
            `SELECT * FROM tasks WHERE ${where} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
            [...params, limit, offset]
        );

        return res.status(200).json({
            tasks: tasksResult.rows,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    }catch(e){
        res.status(500).json({message: e.message});
    }
}

async function createTask(req, res){
    try{
        const project_id = req.params.projectId;
        const title = req.body.title;
        const description = req.body.description;
        const priority = req.body.priority;
        const status = req.body.status || 'todo';
        let deadline = req.body.deadline;
        if(deadline === ''){
            deadline = null;
        }
        if(!title){
            return res.status(400).json({message:'Нет такого заголовка'});
        }
        const task = await pool.query('INSERT INTO tasks (project_id, title, description, priority, status, deadline) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [project_id, title, description, priority, status, deadline]);
        return res.status(201).json({task: task.rows[0]});
    }catch(e){
        res.status(500).json({message: e.message});
    }
}

async function updateTask(req, res){
    try{
        const id = req.params.id;
        const title = req.body.title;
        const description = req.body.description;
        const priority = req.body.priority;
        const status = req.body.status;
        const deadline = req.body.deadline;
        const currentState = await pool.query('SELECT status FROM tasks WHERE id = $1', [id]);
        const task = await pool.query('UPDATE tasks SET title = $1, description = $2, priority = $3, status = $4, deadline = $5 WHERE id = $6 RETURNING *', [title, description, priority, status, deadline, id]);
        if(task.rows.length === 0 ){
            return res.status(404).json({message: "Такой задачи не существует"});
        }
        if(currentState.rows[0].status !== 'done'){
            if(task.rows[0].status === 'done'){
                const userId = req.user.id;
                const xpReward = task.rows[0].xp_reward;
                await pool.query('UPDATE tasks SET completed_at = NOW() WHERE id = $1', [id]);
                await pool.query('UPDATE users SET xp = xp + $1 WHERE id = $2', [xpReward, userId]);
                const userData = await pool.query('SELECT xp, level FROM users WHERE id = $1', [userId]);
                const level = userData.rows[0].level;
                const xp = userData.rows[0].xp;
                const xpLimit = level * 100;
                if(xp >= xpLimit){
                    await pool.query('UPDATE users SET level = level + 1 WHERE id = $1 ', [userId]);
                }
                await checkAndAwardAchievements(userId);
            }
        }
        return res.status(200).json({task: task.rows[0]});
    }catch(e){
        res.status(500).json({message: e.message});
    }
}

async function deleteTask(req, res){
    try{
        const id = req.params.id;
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        return res.status(200).json({message: 'Задача удалена'});
    }catch(e){
        res.status(500).json({message: e.message});
    }
}

module.exports = {getTasks, createTask, updateTask, deleteTask};