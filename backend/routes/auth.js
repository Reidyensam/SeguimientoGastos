const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
require("dotenv").config();

const router = express.Router();

// 🔹 Registro de usuario con generación de token inmediato
router.post("/registro", async (req, res) => {
    try {
        const { nombre, email, contraseña } = req.body;

        if (!nombre || !email || !contraseña) {
            return res.status(400).json({ mensaje: "❌ Todos los campos son obligatorios." });
        }

        if (typeof nombre !== "string" || typeof email !== "string" || typeof contraseña !== "string") {
            return res.status(400).json({ mensaje: "❌ Formato inválido." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ mensaje: "❌ Email inválido." });
        }

        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({ mensaje: "❌ Email ya está registrado." });
        }

        const hashedPassword = await bcrypt.hash(contraseña, 10);
        const nuevoUsuario = await Usuario.create({
            nombre,
            email,
            contraseña: hashedPassword // 🔹 Asegura que el campo `contraseña` coincide con el modelo
        });

        const token = jwt.sign(
            { id: nuevoUsuario.id, email: nuevoUsuario.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(201).json({ mensaje: "✅ Usuario registrado correctamente.", token, usuario: { id: nuevoUsuario.id, nombre: nuevoUsuario.nombre, email: nuevoUsuario.email } });

    } catch (error) {
        console.error("❌ Error en registro:", error);
        res.status(500).json({ mensaje: "❌ Error al registrar usuario." });
    }
});

// 🔹 Inicio de sesión (Login)
router.post("/login", async (req, res) => {
    try {
        const { email, contraseña } = req.body;

        if (!email || !contraseña) {
            return res.status(400).json({ mensaje: "❌ Todos los campos son obligatorios." });
        }

        const usuario = await Usuario.findOne({ where: { email }, attributes: ["id", "nombre", "email", "contraseña"] }); // 🔹 Asegura que `contraseña` esté incluida
        if (!usuario) {
            return res.status(400).json({ mensaje: "❌ Usuario no encontrado." });
        }

        const passwordValida = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!passwordValida) {
            return res.status(400).json({ mensaje: "❌ Contraseña incorrecta." });
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ mensaje: "✅ Login exitoso.", token });

    } catch (error) {
        console.error("❌ Error en login:", error);
        res.status(500).json({ mensaje: "❌ Error al iniciar sesión." });
    }
});

// 🔹 Middleware para verificar JWT
const verificarToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ mensaje: "❌ Token no proporcionado." });
    }

    try {
        const usuarioVerificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = usuarioVerificado;
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: "❌ Token inválido." });
    }
};

// 🔹 Obtener el perfil del usuario
router.get("/perfil", verificarToken, async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id, { attributes: ["id", "nombre", "email"] });

        if (!usuario) {
            return res.status(404).json({ mensaje: "❌ Usuario no encontrado." });
        }

        res.json({ mensaje: "✅ Perfil del usuario.", usuario });

    } catch (error) {
        console.error("❌ Error al obtener perfil:", error);
        res.status(500).json({ mensaje: "❌ Error al obtener perfil." });
    }
});

module.exports = router;