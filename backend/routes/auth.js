const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const Gasto = require("../models/Gasto");
require("dotenv").config();

const router = express.Router();

// 🔹 Registro de usuario con generación de token inmediato
router.post("/registro", async (req, res) => {
    try {
        const { nombre, email, contraseña } = req.body;

        if (!nombre || !email || !contraseña) {
            return res.status(400).json({ mensaje: "Todos los campos son obligatorios." });
        }

        if (typeof nombre !== "string" || typeof email !== "string" || typeof contraseña !== "string") {
            return res.status(400).json({ mensaje: "Formato inválido. Todos los datos deben ser texto." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ mensaje: "Email inválido. Usa un formato válido (ejemplo@correo.com)." });
        }

        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({ mensaje: "El usuario ya está registrado." });
        }

        const hashedPassword = await bcrypt.hash(contraseña, 10);
        const nuevoUsuario = await Usuario.create({ nombre, email, contraseña: hashedPassword });

        const token = jwt.sign({ id: nuevoUsuario.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({ 
            mensaje: "Usuario registrado correctamente.", 
            token, 
            usuario: { id: nuevoUsuario.id, nombre: nuevoUsuario.nombre, email: nuevoUsuario.email } 
        });

    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ mensaje: "Error al registrar usuario.", error });
    }
});

// 🔹 Inicio de sesión (Login)
router.post("/login", async (req, res) => {
    try {
        const { email, contraseña } = req.body;

        if (!email || !contraseña) {
            return res.status(400).json({ mensaje: "Todos los campos son obligatorios." });
        }

        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(400).json({ mensaje: "Usuario no encontrado." });
        }

        const passwordValida = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!passwordValida) {
            return res.status(400).json({ mensaje: "Contraseña incorrecta." });
        }

        const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ mensaje: "Login exitoso.", token });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ mensaje: "Error al iniciar sesión.", error });
    }
});

// 🔹 Middleware para verificar JWT
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

// 🔹 Obtener el perfil del usuario
router.get("/perfil", verificarToken, async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id, { attributes: ["id", "nombre", "email"] });

        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado." });
        }

        res.json({ mensaje: "Perfil del usuario.", usuario });
    } catch (error) {
        console.error("Error al obtener perfil:", error);
        res.status(500).json({ mensaje: "Error al obtener perfil.", error });
    }
});

// 🔹 Obtener todos los gastos del usuario
router.get("/gastos", verificarToken, async (req, res) => {
    try {
        const gastos = await Gasto.findAll({ where: { usuarioId: req.usuario.id } });

        if (!gastos.length) {
            return res.status(404).json({ mensaje: "No hay gastos registrados." });
        }

        res.json(gastos);
    } catch (error) {
        console.error("Error al obtener los gastos:", error);
        res.status(500).json({ mensaje: "Error al obtener los gastos.", error });
    }
});

// 🔹 Crear nuevo gasto
router.post("/gastos", verificarToken, async (req, res) => {
    try {
        const { nombre, monto } = req.body;

        if (!nombre || isNaN(monto) || monto <= 0) {
            return res.status(400).json({ mensaje: "Datos inválidos. Verifica que el nombre y monto sean correctos." });
        }

        const nuevoGasto = await Gasto.create({ nombre, monto, usuarioId: req.usuario.id });

        res.status(201).json(nuevoGasto);
    } catch (error) {
        console.error("Error al crear gasto:", error);
        res.status(500).json({ mensaje: "Error al crear el gasto.", error });
    }
});

// 🔹 Eliminar un gasto por su ID
router.delete("/gastos/:id", verificarToken, async (req, res) => {
    try {
        const gasto = await Gasto.findOne({ where: { id: req.params.id, usuarioId: req.usuario.id } });

        if (!gasto) {
            return res.status(404).json({ mensaje: "Gasto no encontrado o no pertenece al usuario." });
        }

        await gasto.destroy();
        res.status(200).json({ mensaje: "Gasto eliminado correctamente." });

    } catch (error) {
        console.error("Error al eliminar gasto:", error);
        res.status(500).json({ mensaje: "Error al eliminar el gasto.", error });
    }
});

module.exports = router;