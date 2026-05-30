export const roleCheck = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false, 
                message: "User not authenticated"
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false, 
                message: `Access Denied. Required role: ${allowedRoles.join(" or ")}`
            });
        }
        next();
    };
};
