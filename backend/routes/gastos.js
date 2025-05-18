const express = require("express");
const Gasto = require("../models/Gasto");
const verificarToken = require("../middleware/verificarToken");

const router = express.Router();

// 🔹 Obtener todos los gastos del usuario autenticado
router.get("/", verificarToken, async (req, res) => {
    try {
        const gastos = await Gasto.findAll({
            where: { usuarioId: req.usuario.id },
            attributes: ["id", "nombre", "monto", "categoria", "fecha"]
        });

        console.log("📤 Gastos enviados al frontend:", gastos); // 🔹 Confirma que `nombre` se está enviando correctamente

        res.json(gastos.length > 0 ? gastos : []);
    } catch (error) {
        console.error("❌ Error al obtener los gastos:", error);
        res.status(500).json({ mensaje: "❌ Error interno en el servidor." });
    }
});

// 🔹 Crear nuevo gasto
router.post("/", verificarToken, async (req, res) => {
    try {
        console.log("📥 Solicitud recibida en el backend:", req.body);
        console.log("🎯 Nombre recibido en el backend:", req.body.nombre); // 🔹 Confirma que `nombre` llega correctamente

        const { nombre, monto, fecha, categoria } = req.body;

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
    nombre: req.body.nombre?.trim() || "Sin Nombre", // 🔹 Asegura que `nombre` siempre tenga un valor
    monto: parseFloat(req.body.monto),
    fecha: new Date(req.body.fecha),
    categoria: req.body.categoria.trim(),
    usuarioId: req.usuario.id
});

        console.log("✅ Gasto creado correctamente:", nuevoGasto);

        res.status(201).json(nuevoGasto);
    } catch (error) {
        console.error("❌ Error al crear el gasto:", error);
        res.status(500).json({ mensaje: "❌ Error interno al crear el gasto." });
    }
});

// 🔹 Actualizar un gasto por ID
router.put("/:id", verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, monto, fecha, categoria } = req.body;

        const gasto = await Gasto.findOne({ where: { id, usuarioId: req.usuario.id } });

        if (!gasto) {
            return res.status(404).json({ mensaje: "❌ Gasto no encontrado." });
        }

        if (nombre && !nombre.trim()) {
            return res.status(400).json({ mensaje: "❌ Nombre inválido." });
        }

        if (monto && (isNaN(monto) || Number(monto) <= 0)) {
            return res.status(400).json({ mensaje: "❌ Monto inválido." });
        }

        if (fecha && isNaN(Date.parse(fecha))) {
            return res.status(400).json({ mensaje: "❌ Fecha inválida." });
        }

        if (categoria && !categoria.trim()) {
            return res.status(400).json({ mensaje: "❌ Categoría inválida." });
        }

        await gasto.update({
            nombre: nombre?.trim() || gasto.nombre,
            monto: monto ? parseFloat(monto) : gasto.monto,
            fecha: fecha ? new Date(fecha) : gasto.fecha,
            categoria: categoria?.trim() || gasto.categoria
        });

        console.log("🔄 Gasto actualizado correctamente:", gasto);

        res.json({ mensaje: "✅ Gasto actualizado correctamente." });
    } catch (error) {
        console.error("❌ Error al actualizar el gasto:", error);
        res.status(500).json({ mensaje: "❌ Error interno al actualizar el gasto." });
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
        console.log("🗑 Gasto eliminado correctamente:", id);

        res.json({ mensaje: "✅ Gasto eliminado correctamente." });
    } catch (error) {
        console.error("❌ Error al eliminar el gasto:", error);
        res.status(500).json({ mensaje: "❌ Error interno al eliminar el gasto." });
    }
});

module.exports = router;