const pool = require('../config/db');

async function getProjects(req, res){
    try{
        const userId = req.user.id;
        const arrayOfProjects = await pool.query('SELECT * FROM projects WHERE user_id = $1', [userId]);
        return res.status(201).json({projects: arrayOfProjects.rows});
    }catch(e){
        res.status(500).json({message: e.message});
    }
}

async function createProject(req, res){
    try{
        const userId = req.user.id;
        const title = req.body.title;
        const description = req.body.description;
        if(!title){
            return res.status(400).json({message: 'Нет такого заголовка'});
        }
        const project = await pool.query('INSERT INTO projects (user_id, title, description) VALUES ($1, $2, $3) RETURNING *', [userId, title, description]);
        return res.status(201).json({project: project.rows[0]});
    }catch(e){
        res.status(500).json({message: e.message});
    }
}

async function updateProject(req, res){
    try{
        const project_id = req.params.id;
        const newTitle = req.body.title;
        const newDescription = req.body.description;
        const newStatus = req.body.status;
        const result = await pool.query('UPDATE projects SET title = $1, description = $2, status = $3 WHERE id = $4 RETURNING *', [newTitle, newDescription,newStatus,project_id,]);
        return res.status(201).json({project: result.rows[0]});
    }catch(e){
        res.status(500).json({message: e.message});
    }
}

async function deleteProject(req, res){
    try{
        const project_id = req.params.id;
        await pool.query('DELETE FROM projects WHERE id = $1', [project_id]);
        return res.status(200).json({message: 'Проект удалён'});
    }catch(e){
        res.status(500).json({message: e.message});
    }
}

async function getProjectById(req, res){
    try{
        const id = req.params.id;
        const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
        if(result.rows.length === 0){
            return res.status(404).json({message: 'Проект не найден'})
        }
        return res.status(200).json({project: result.rows[0]});
    }catch(e){
        res.status(500).json({message: e.message});
    }
}

async function getProjectStatistics(req, res){
    try{
        const id = req.params.id;
        const result = await pool.query('SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status = \'done\') AS completed FROM tasks WHERE project_id = $1', [id]);
        return res.status(200).json({stats: result.rows[0]});
    }catch (e) {
        res.status(500).json({message: e.message});
    }
}

module.exports = {getProjects, createProject, updateProject, deleteProject, getProjectById, getProjectStatistics};