const sequelize = require("../handlers/database");
const { DataTypes } = require("sequelize");

module.exports = sequelize.define("staff", {
  user: { type: DataTypes.STRING, unique: true, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false },
  points: { type: DataTypes.INTEGER, defaultValue: 0 },
  tickets: { type: DataTypes.JSON, defaultValue: [] },
});
