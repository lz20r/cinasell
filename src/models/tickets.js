// ticketSystem.js
const sequelize = require("../handlers/database");
const { DataTypes } = require("sequelize");

const ticketSystem = sequelize.define("ticketSystem", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  guildId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  threadId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  language: {
    type: DataTypes.ENUM("es", "en"),
    defaultValue: "es",
    allowNull: false
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM("low", "medium", "high"),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM("closed", "open", "in-progress"),
    allowNull: true
  },
  claimedBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pickedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  closedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  closedBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  closedReason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notesBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notesAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = ticketSystem;
