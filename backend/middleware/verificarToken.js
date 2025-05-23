const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ mensaje: "Token no proporcionado." });
    }

    try {
        const usuarioVerificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = usuarioVerificado;
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: "Token inválido." });
    }
};

module.exports = verificarToken;