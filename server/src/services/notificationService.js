const pool = require('../config/db');

async function checkDeadlines(io, userSockets){
    try{
        console.log('NOW:', new Date());
        const result = await pool.query('SELECT t.*, p.user_id as user_id FROM tasks t JOIN projects p ON t.project_id = p.id WHERE t.deadline BETWEEN NOW() AND NOW() + INTERVAL \'24 hours\' AND t.status != \'done\'')
        console.log('Найдено задач:', result.rows);
        console.log('Найдено задач с дедлайном:', result.rows.length);
        console.log('Подключённые пользователи:', userSockets);
        result.rows.forEach(task => {
            const userId = task.user_id;
            console.log('Задача:', task.title, 'userId:', task.user_id);
            const socketId = userSockets.get(userId);
            console.log('socketId:', socketId);
            if(socketId) {
                io.to(socketId).emit('notification', {
                    message: `Дедлайн задачи "${task.title}" истекает через 24 часа!`,
                    taskId: task.id
                });
            }
        })
    }catch (e) {
        throw new Error(e.message)
    }
}

module.exports = { checkDeadlines };