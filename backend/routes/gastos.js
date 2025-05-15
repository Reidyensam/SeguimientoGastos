const express = require("express");
const Gasto = require("../models/Gasto");
const verificarToken = require("../middleware/verificarToken");

const router = express.Router();

// 🔹 Obtener todos los gastos del usuario autenticado
router.get("/", verificarToken, async (req, res) => {
    try {
        if (!req.usuario || !req.usuario.id) {
            return res.status(403).json({ mensaje: "❌ Usuario no autenticado." });
        }

        const gastos = await Gasto.findAll({ where: { usuarioId: req.usuario.id } });

        if (!gastos.length) {
            return res.status(200).json({ mensaje: "✅ No hay gastos registrados." });
        }

        res.json(gastos);
    } catch (error) {
        console.error("❌ Error al obtener los gastos:", error);
        res.status(500).json({ mensaje: "❌ Error interno en el servidor." });
    }
});

// 🔹 Crear nuevo gasto
router.post("/", verificarToken, async (req, res) => {
    try {
        const { nombre, monto, fecha, categoria } = req.body;

        if (!req.usuario || !req.usuario.id) {
            return res.status(403).json({ mensaje: "❌ Usuario no autenticado." });
        }

        // 🔹 Validaciones mejoradas
        if (!nombre?.trim()) {
            return res.status(400).json({ mensaje: "❌ Nombre inválido." });
        }

        if (!monto || isNaN(monto) || Number(monto) <= 0) {
            return res.status(400).json({ mensaje: "❌ Monto inválido." });
        }

        if (!fecha || isNaN(Date.parse(fecha))) {
            return res.status(400).json({ mensaje: "❌ Fecha inválida." });
        }

        if (!categoria?.trim()) {
            return res.status(400).json({ mensaje: "❌ Categoría inválida." });
        }

        const nuevoGasto = await Gasto.create({
            nombre: nombre.trim(),
            monto: parseFloat(monto),
            fecha: new Date(fecha),
            categoria: categoria.trim(),
            usuarioId: req.usuario.id
        });

        res.status(201).json(nuevoGasto);
    } catch (error) {
        console.error("❌ Error al crear el gasto:", error);
        res.status(500).json({ mensaje: "❌ Error interno al crear el gasto." });
    }
});

// 🔹 Eliminar un gasto por ID
router.delete("/:id", verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.usuario || !req.usuario.id) {
            return res.status(403).json({ mensaje: "❌ Usuario no autenticado." });
        }

        const gasto = await Gasto.findOne({ where: { id, usuarioId: req.usuario.id } });

        if (!gasto) {
            return res.status(404).json({ mensaje: "❌ Gasto no encontrado." });
        }

        await gasto.destroy();
        res.json({ mensaje: "✅ Gasto eliminado correctamente." });
    } catch (error) {
        console.error("❌ Error al eliminar el gasto:", error);
        res.status(500).json({ mensaje: "❌ Error interno al eliminar el gasto." });
    }
});

module.exports = router;