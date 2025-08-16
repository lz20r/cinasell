const sequelize = require("../handlers/database");
const { DataTypes } = require("sequelize");

module.exports = sequelize.define("farewell", {
  guildId: { type: DataTypes.STRING, unique: true, allowNull: false },
  channel: { type: DataTypes.STRING },
  title: { type: DataTypes.STRING },
  message: { type: DataTypes.TEXT },
  image: { type: DataTypes.STRING },
  color: { type: DataTypes.STRING }
});
