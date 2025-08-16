const sequelize = require("../handlers/database");
const { DataTypes } = require("sequelize");

module.exports = sequelize.define("AccountsDrop", {
  type: { type: DataTypes.STRING },
  account: { type: DataTypes.STRING },
});
