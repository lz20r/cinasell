const { DataTypes } = require("sequelize");
const sequelize = require("../handlers/database");

const AutoResponder = sequelize.define("AutoResponder", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    guildId: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    trigger_text: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    response: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    delete_after: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    wildcards: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: "autoResponders",
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['guildId', 'trigger_text'] // 🔹 Restricción ÚNICA por servidor
        }
    ]
});

module.exports = AutoResponder;