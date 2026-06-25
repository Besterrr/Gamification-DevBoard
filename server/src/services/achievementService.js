const pool = require('../config/db');

async function checkAndAwardAchievements(userId){
    try{
        const CountOfFinishTasks = await pool.query('SELECT COUNT(*) FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.user_id = $1 AND t.status = \'done\'', [userId])
        const tasksCount = parseInt(CountOfFinishTasks.rows[0].count);
        const CountOfFinishProjects = await pool.query('SELECT COUNT(*) FROM projects WHERE user_id = $1 AND status = \'done\'', [userId])
        const projectCount = parseInt(CountOfFinishProjects.rows[0].count);
        const toCheck = [
            { key: 'first_task', condition: tasksCount >= 1 },
            { key: 'task_10', condition: tasksCount >= 10 },
            { key: 'task_20', condition: tasksCount >= 20 },
            { key: 'task_50', condition: tasksCount >= 50 },
            { key: 'task_100', condition: tasksCount >= 100 },
            { key: 'first_project', condition: projectCount >= 1 },
            { key: 'project_5', condition: projectCount >= 5 },
            { key: 'project_10', condition: projectCount >= 10 },
            { key: 'project_20', condition: projectCount >= 20 },
            { key: 'project_50', condition: projectCount >= 50 },
            { key: 'project_100', condition: projectCount >= 100 },
        ];
        for(const item of toCheck){
            const achievement = await pool.query('SELECT id, xp_bonus FROM achievements WHERE key = $1', [item.key]);
            const achievementId = achievement.rows[0].id;
            const xpBonus = achievement.rows[0].xp_bonus;
            if(item.condition){
                const isGived = await pool.query('SELECT id FROM user_achievements WHERE user_id = $1 AND achievement_id = $2', [userId, achievementId])
                if(isGived.rows.length === 0){
                    await pool.query('INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2)', [userId, achievementId]
                    );
                    await pool.query('UPDATE users SET xp = xp + $1 WHERE id = $2', [xpBonus, userId]);
                }
            }
        }
    }catch(e){
        throw new Error(e.message);
    }
}

module.exports = { checkAndAwardAchievements };