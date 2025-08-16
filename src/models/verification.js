const sequelize = require("../handlers/database");
const { DataTypes } = require("sequelize");

module.exports = sequelize.define("Verification", {
  guildId: { type: DataTypes.STRING, unique: true, allowNull: false },
  roleId: { type: DataTypes.STRING, allowNull: false },
});
