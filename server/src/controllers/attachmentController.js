const pool = require('../config/db');

async function uploadTheAttachment(req, res) {
    try{
        const task_id = req.params.id;
        const {filename, originalname, mimetype, size} = req.file;
        const attachment = await pool.query('INSERT INTO task_attachments (task_id, filename, original_name, mimetype, size) VALUES ($1, $2, $3, $4, $5) RETURNING *', [task_id,filename, originalname, mimetype, size]);
        return res.status(201).json({attachments: attachment.rows[0]});
    }catch(e){
        res.status(500).json({message: e.message})
    }
}

async function getAttachments(req, res) {
    try{
        const task_id = req.params.id;
        const data = await pool.query('SELECT * FROM task_attachments WHERE task_id = $1', [task_id]);
        return res.status(200).json({attachments: data.rows});
    }catch(e){
        res.status(500).json({message: e.message})
    }
}

module.exports = {uploadTheAttachment, getAttachments}