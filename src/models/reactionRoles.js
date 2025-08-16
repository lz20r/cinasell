const sequelize = require("../handlers/database");
const { DataTypes } = require("sequelize");

module.exports = sequelize.define("reactionRoles", {
  messageId: { type: DataTypes.STRING, allowNull: false },
  roleId: { type: DataTypes.STRING, allowNull: false },
  emojiId: { type: DataTypes.STRING, allowNull: false }
});