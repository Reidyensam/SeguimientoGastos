const { Sequelize } = require("sequelize");
require("dotenv").config();

// 🔹 Validar que las variables de entorno estén definidas
if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASSWORD) {
    console.error("❌ Error: Faltan variables de entorno en `.env`.");
    process.exit(1);
}

// 🔹 Configurar conexión con PostgreSQL
const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASSWORD.trim(),  // 🔹 Asegura que la contraseña sea un string
    {
        host: process.env.DB_HOST || "localhost",
        dialect: "postgres",
        logging: false,
        dialectOptions: {
            ssl: process.env.DB_SSL === "true" // 🔹 Se ajusta SSL según `.env`
        }
    }
);

// 🔹 Validar conexión al iniciar
sequelize.authenticate()
    .then(() => console.log("✅ Conexión con PostgreSQL establecida correctamente."))
    .catch(error => {
        console.error("❌ Error al conectar con PostgreSQL:", error);
        process.exit(1);  // 🔹 Si falla, detiene la ejecución
    });

module.exports = sequelize;