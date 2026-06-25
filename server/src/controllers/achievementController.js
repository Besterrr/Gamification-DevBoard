const pool = require('../config/db');

async function getAchievements(req, res) {
    try{
        const userId = req.user.id;
        const achievements = await pool.query('SELECT a.*, ua.earned_at FROM achievements a LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1'
            , [userId]);
        const result = achievements.rows.map(achievement => ({
            ...achievement,
            earned: !!achievement.earned_at
        }));
        return res.status(200).json({ achievements: result });
    }catch (e) {
        res.status(500).json({message: e.message});
    }
}

module.exports = {getAchievements}
