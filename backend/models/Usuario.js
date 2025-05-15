const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Asegúrate de que el archivo exista

const Usuario = sequelize.define("Usuario", {
  id: { type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  contraseña: { type: DataTypes.STRING, allowNull: false }
});

module.exports = Usuario;