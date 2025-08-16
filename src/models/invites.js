// models/invites.js
const sequelize = require("../handlers/database");
const { DataTypes } = require("sequelize");

const Invites = sequelize.define("Invites", {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  inviteCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  inviterId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  uses: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = Invites;
