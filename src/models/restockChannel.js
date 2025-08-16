const { DataTypes } = require("sequelize");
const sequelize = require("../handlers/database");

const RestockChannel = sequelize.define(
  "RestockChannel",
  {
    guildId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    channelId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "restock_channels",
    timestamps: true,
  }
);

module.exports = RestockChannel;
