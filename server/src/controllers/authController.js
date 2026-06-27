const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function generateTokens(userId){
    const accessToken = jwt.sign({id: userId},process.env.JWT_SECRET, {expiresIn: '15m'});
    const refreshToken = jwt.sign({id: userId},process.env.JWT_REFRESH_SECRET, {expiresIn: '7d'});
    return {accessToken, refreshToken};
}

async function register(req, res) {
    try{
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
        return res.status(400).json({message: 'Ошибка, отсутствуют данные'})
    }
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if(result.rows.length === 0){
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await pool.query('INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username, xp, level', [email, username, passwordHash]);
        const { accessToken, refreshToken } = generateTokens(newUser.rows[0].id);
        res.status(201).json({ newUser: newUser.rows[0], accessToken, refreshToken });
    }else{
        return res.status(400).json({ message: 'Пользователь не найден' });
    }
    }catch(e){
        res.status(500).json({message: e.message})
    }
}

async function login(req, res) {
    try{
        const {email, password} = req.body;
        const hasInTable = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if(hasInTable.rows.length === 0){
            return res.status(401).json({message: 'Пользователя с таким email не найдено'})
        }
        const unHashPassword = await bcrypt.compare(password, hasInTable.rows[0].password_hash);
        if(unHashPassword){
            const {password_hash, created_at, ...userWithoutPassword} = hasInTable.rows[0]
            const { accessToken, refreshToken } = generateTokens(hasInTable.rows[0].id);
            res.status(200).json({ user: userWithoutPassword, accessToken, refreshToken});
        }else{
            res.status(401).json({message: 'Пароль неверный'})
        }
    }catch(e){
        res.status(500).json({message: e.message})
    }
}

async function refresh(req, res) {
    try{
        const {refreshToken} = req.body;
        if(!refreshToken){
            return res.status(401).json({message: 'Refresh token отсутствует'})
        }
        try{
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
            const id = decoded.id;
            const {accessToken, refreshToken: newRefreshToken} = generateTokens(id)
            res.status(200).json({ accessToken, refreshToken: newRefreshToken });
        }catch(e){
            res.status(401).json({message: e.message})
        }
    }catch(e){
       res.status(500).json({message: e.message})
    }
}

async function getUserData(req,res){
    try{
        const userId = req.user.id;
        const data = await pool.query('SELECT id, username, email, xp, level, avatar_url FROM users WHERE id = $1', [userId]);
        if(data.rows.length === 0){
            return res.status(401).json({message: 'Пользователя с таким id не найдено'})
        }
        return res.status(200).json({user: data.rows[0]});
    }catch(e){
        res.status(500).json({message: e.message})
    }
}

module.exports = {login, register, refresh, getUserData};