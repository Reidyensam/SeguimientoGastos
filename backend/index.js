const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
require("dotenv").config(); // 🔹 Cargar variables de entorno

// Importar modelos
const Usuario = require("./models/Usuario");
const Gasto = require("./models/Gasto");

// Importar rutas
const authRoutes = require("./routes/auth");
const gastosRoutes = require("./routes/gastos");

const app = express(); // 🔹 Definir `app` antes de usar `app.use()`

// 🔹 Configurar CORS para permitir solicitudes del frontend
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// 🔹 Conectar las rutas asegurando que existen
if (authRoutes) {
    app.use("/api/auth", authRoutes);
} else {
    console.error("❌ Error: No se pudo cargar las rutas de autenticación.");
}

if (gastosRoutes) {
    app.use("/api/gastos", gastosRoutes);
} else {
    console.error("❌ Error: No se pudo cargar las rutas de gastos.");
}

// 🔹 Validar que los modelos estén cargados antes de sincronizar la base de datos
sequelize.authenticate()
    .then(() => {
        console.log("✅ Conexión con la base de datos establecida exitosamente.");
        return sequelize.sync({ alter: true });
    })
    .then(() => {
        console.log("✅ Modelos sincronizados correctamente.");
        iniciarServidor();
    })
    .catch(error => {
        console.error("❌ Error al conectar la base de datos:", error);
    });

// 🔹 Middleware global de manejo de errores
app.use((err, req, res, next) => {
    console.error("❌ Error en la aplicación:", err);
    res.status(err.status || 500).json({ mensaje: err.message || "Error interno del servidor." });
});

// 🔹 Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({ mensaje: "Ruta no encontrada." });
    next(); // 🔹 Para evitar bloqueos en el middleware
});

// 🔹 Iniciar el servidor solo después de que los modelos estén sincronizados
const iniciarServidor = () => {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en el puerto ${PORT}.`);
        console.log(`📌 API de autenticación disponible en: http://localhost:${PORT}/api/auth`);
        console.log(`📌 API de gastos disponible en: http://localhost:${PORT}/api/gastos`);
    });
};