const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: "postgres",
        logging: false,
        dialectOptions: {
            ssl: process.env.DB_SSL === "true" // 🔹 Se ajusta SSL desde `.env`
        }
    }
);

// 🔹 Validar conexión al iniciar
sequelize.authenticate()
    .then(() => console.log("✅ Conexión con PostgreSQL establecida correctamente."))
    .catch(error => console.error("❌ Error al conectar con PostgreSQL:", error));

module.exports = sequelize;