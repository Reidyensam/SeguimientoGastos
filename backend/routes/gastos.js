const express = require("express");
const Gasto = require("../models/Gasto");
const verificarToken = require("../middleware/verificarToken");

const router = express.Router();

// 🔹 Obtener todos los gastos del usuario
router.get("/", verificarToken, async (req, res) => {
    try {
        const gastos = await Gasto.findAll({ where: { usuarioId: req.usuario.id } });

        res.json(gastos.length ? gastos : { mensaje: "No hay gastos registrados." });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener los gastos.", error });
    }
});

// 🔹 Crear nuevo gasto
router.post("/", verificarToken, async (req, res) => {
    try {
        const { nombre, monto } = req.body;
        if (!nombre || isNaN(monto) || monto <= 0) {
            return res.status(400).json({ mensaje: "Datos inválidos." });
        }

        const nuevoGasto = await Gasto.create({ nombre, monto, usuarioId: req.usuario.id });

        res.status(201).json(nuevoGasto);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al crear el gasto.", error });
    }
});

module.exports = router;