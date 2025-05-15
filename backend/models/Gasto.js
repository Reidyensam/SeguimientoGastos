const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Usuario = require("./Usuario");

const Gasto = sequelize.define("Gasto", {
  id: { type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  fecha: { type: DataTypes.DATE, allowNull: false },
  monto: { type: DataTypes.FLOAT, allowNull: false },
  categoria: { type: DataTypes.STRING, allowNull: false },
  usuarioId: { type: DataTypes.UUID, allowNull: false }
});

// Relación entre Usuario y Gasto
Gasto.belongsTo(Usuario, { foreignKey: "usuarioId" });
Usuario.hasMany(Gasto, { foreignKey: "usuarioId" });

module.exports = Gasto;