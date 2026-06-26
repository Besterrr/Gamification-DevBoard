const pool = require('../config/db');

async function getActivityStats(req, res) {
    try{
        const dates = new Map();
        const days = parseInt(req.query.days) || 7;
        const userId = req.user.id;
        const result = await pool.query(
            `SELECT DATE(t.completed_at) AS date, COUNT(*) AS count
             FROM tasks t JOIN projects p ON t.project_id = p.id
             WHERE p.user_id = $1 AND t.status = 'done' AND t.completed_at IS NOT NULL AND t.completed_at >= NOW() - INTERVAL '1 day' * $2
             GROUP BY DATE(t.completed_at)`,
            [userId, days]
        );
        for(let i = days-1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const formatDate = date.toISOString().split('T')[0];
            dates.set(String(formatDate), 0);
        }
        result.rows.forEach((row) => {
            const data = row.date.toISOString().split('T')[0];
            if(dates.has(data)){
                dates.set(data, parseInt(row.count));
            }
        })
        const arrOfDates = Array.from(dates,([key, value]) => ({date: key, count: value}))
        return res.status(200).json({activity: arrOfDates});
    }catch(e){
        res.status(500).json({message: e.message})
    }
}

module.exports = {getActivityStats};