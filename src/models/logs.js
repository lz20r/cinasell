const sequelize = require("../handlers/database");
const { DataTypes } = require("sequelize");

module.exports = sequelize.define("logs", {
  guildId: { type: DataTypes.STRING, unique: true, allowNull: false },
  logChannel: { type: DataTypes.STRING, allowNull: false }
});