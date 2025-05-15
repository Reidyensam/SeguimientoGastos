const express = require("express");
const Gasto = require("../models/Gasto");
const verificarToken = require("../middleware/verificarToken");

const router = express.Router();

// 🔹 Obtener todos los gastos del usuario autenticado
router.get("/", verificarToken, async (req, res) => {
    try {
        const gastos = await Gasto.findAll({ where: { usuarioId: req.usuario.id } });

        if (!gastos.length) {
            return res.status(200).json({ mensaje: "✅ No hay gastos registrados." });
        }

        res.json(gastos);
    } catch (error) {
        console.error("❌ Error al obtener los gastos:", error);
        res.status(500).json({ mensaje: "❌ Error al obtener los gastos." });
    }
});

// 🔹 Crear nuevo gasto
router.post("/", verificarToken, async (req, res) => {
    try {
        const { nombre, monto } = req.body;

        // 🔹 Validación mejorada para evitar errores
        if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
            return res.status(400).json({ mensaje: "❌ Nombre del gasto inválido." });
        }

        if (!monto || isNaN(monto) || Number(monto) <= 0) {
            return res.status(400).json({ mensaje: "❌ Monto inválido, debe ser un número positivo." });
        }

        const nuevoGasto = await Gasto.create({
            nombre: nombre.trim(),
            monto: parseFloat(monto),
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