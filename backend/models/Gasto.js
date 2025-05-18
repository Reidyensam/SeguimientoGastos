const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Usuario = require("./Usuario");

const Gastos = sequelize.define("Gastos", {  // 🔹 Usa el nombre exacto de la tabla en la BD
  id: { type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  nombre: { type: DataTypes.STRING, allowNull: false, defaultValue: "Sin nombre" }, // 🔹 Asegura que `nombre` existe en el modelo
  fecha: { type: DataTypes.DATE, allowNull: false },
  monto: { type: DataTypes.FLOAT, allowNull: false },
  categoria: { type: DataTypes.STRING, allowNull: false },
  usuarioId: { type: DataTypes.UUID, allowNull: false }
}, {
  tableName: "Gastos", // 🔹 Evita que Sequelize cambie el nombre de la tabla
  timestamps: false
});

// Relación entre Usuario y Gastos
Gastos.belongsTo(Usuario, { foreignKey: "usuarioId" });
Usuario.hasMany(Gastos, { foreignKey: "usuarioId" });

module.exports = Gastos;