const { DataTypes } = require("sequelize");
const sequelize = require("../handlers/database");

const RoleNickname = sequelize.define("RoleNickname", {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  roleId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = RoleNickname;
