const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
require("dotenv").config(); // 🔹 Cargar variables de entorno

const app = express(); // 🔹 Definir `app` antes de usar `app.use()`

// 🔹 Configurar CORS para permitir solicitudes del frontend
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json()); // 🔹 Middleware para procesar JSON correctamente

// 🔹 Importar rutas después de definir `app`
const authRoutes = require("./routes/auth");
const gastosRoutes = require("./routes/gastos");

// 🔹 Conectar rutas sin verificaciones innecesarias
app.use("/api/auth", authRoutes);
app.use("/api/gastos", gastosRoutes);

// 🔹 Validar conexión con la base de datos antes de iniciar el servidor
const iniciarServidor = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Conexión con la base de datos establecida exitosamente.");

        await sequelize.sync({ alter: true }); // 🔹 Ajusta la estructura sin eliminar datos
        console.log("✅ Modelos sincronizados correctamente.");

        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en el puerto ${PORT}.`);
            console.log(`📌 API de autenticación disponible en: http://localhost:${PORT}/api/auth`);
            console.log(`📌 API de gastos disponible en: http://localhost:${PORT}/api/gastos`);
        });
    } catch (error) {
        console.error("❌ Error al conectar la base de datos:", error.message);
        process.exit(1); // 🔹 Detiene el servidor si la conexión falla
    }
};

// 🔹 Middleware global de manejo de errores
app.use((err, req, res, next) => {
    console.error("❌ Error en la aplicación:", err.message);
    res.status(err.status || 500).json({ mensaje: err.message || "Error interno del servidor." });
});

// 🔹 Middleware para manejar rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ mensaje: "❌ Ruta no encontrada." });
});

// 🔹 Iniciar el servidor
iniciarServidor();