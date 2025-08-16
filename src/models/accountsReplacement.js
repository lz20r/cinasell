const sequelize = require("../handlers/database");
const { DataTypes } = require("sequelize");

module.exports = sequelize.define("AccountsReplacement", {
  type: { type: DataTypes.STRING },
  account: { type: DataTypes.STRING },
});
