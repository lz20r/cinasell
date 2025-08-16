const sequelize = require("../handlers/database");
const { DataTypes } = require("sequelize");

module.exports = sequelize.define("stickiedMsg", {
  channel: { type: DataTypes.STRING, unique: true, allowNull: false },
  message: { type: DataTypes.TEXT }, 
});
