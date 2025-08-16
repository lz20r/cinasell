const { DataTypes } = require("sequelize");
const sequelize = require("../handlers/database");

const AutoRole = sequelize.define("AutoRole", {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Un solo autorol por servidor
  },
  roleId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: "autoroles",
  timestamps: true,
});

module.exports = AutoRole;
