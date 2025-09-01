import jwt from 'jsonwebtoken';

const isAuth = (req, res, next) => {
    const token = req.cookies.accessToken; 

    if (!token) {
        return res.status(401).json({ message: 'No token provided. Authorization denied.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid. Authorization denied.' });
    }
};

export default isAuth;