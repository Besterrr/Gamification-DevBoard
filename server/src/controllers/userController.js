const pool = require('../config/db');

async function uploadAvatar(req, res){
    try{
        if(!req.file){
            res.status(400).json({message: 'Файл не найден'});
            return;
        }
        const filename = req.file.filename;
        const avatarUrl = '/uploads/avatars/' + filename;
        const id = req.user.id;
        await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING *',[avatarUrl, id]);
        return res.status(200).json({avatarUrl: avatarUrl});
    }catch (e) {
        res.status(500).json({message: e.message});
    }
}

module.exports = {uploadAvatar};