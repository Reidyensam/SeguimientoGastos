const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Usuario = sequelize.define("Usuario", {
    id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
    },
    nombre: { 
        type: DataTypes.STRING, 
        allowNull: false,
        validate: { 
            len: [3, 50] // 🔹 Asegura que el nombre tenga entre 3 y 50 caracteres
        }
    },
    email: { 
        type: DataTypes.STRING, 
        unique: true, 
        allowNull: false,
        validate: { isEmail: true },
        set(value) { 
            this.setDataValue("email", value.toLowerCase()); // 🔹 Convierte el email a minúsculas
        }
    },
    contraseña: { 
        type: DataTypes.STRING, 
        allowNull: false,
        validate: { 
            len: [8, 100] // 🔹 Asegura que la contraseña tenga mínimo 8 caracteres
        }
    }
}, {
    tableName: "usuarios", 
    timestamps: true
});

module.exports = Usuario;