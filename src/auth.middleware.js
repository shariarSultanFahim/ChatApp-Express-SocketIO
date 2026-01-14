const jwt = require("jsonwebtoken");
const User = require("./services/v1/users/model/User");
const { JWT_SECRET } = require("./configuration");

const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, error: "Not authorized to access this route" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        
        if (!req.user) {
            return res.status(401).json({ success: false, error: "User not found" });
        }
        
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ success: false, error: "Not authorized to access this route from protect" });
    }
};

module.exports = protect;