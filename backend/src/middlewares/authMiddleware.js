import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const isAuth = async (req, res, next) => {
    const token = req.cookies?.accessToken; 

    if (!token) {
        return res.status(401).json({ message: 'No token provided. Authorization denied.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        req.user = user; 
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid. Authorization denied.' });
    }
};

export default isAuth;