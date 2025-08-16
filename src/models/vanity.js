const sequelize = require("../handlers/database");
const { DataTypes } = require("sequelize");

const Vanity = sequelize.define("Vanity", {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  channel: {
    type: DataTypes.STRING,
    allowNull: false
  },
  language: {
    type: DataTypes.STRING,
    validate: {
      isIn: [["es", "en"]]
    },
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  reaction: {
    type: DataTypes.STRING,
    allowNull: true // Reacción es opcional
  }
});

module.exports = Vanity;
