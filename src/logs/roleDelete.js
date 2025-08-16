const { time, TimestampStyles } = require("discord.js");

module.exports = {
    name: "roleDelete",

    load(data, channel, client) {
        const role = data.target;

        const created = role?.createdAt
            ? time(role.createdAt, TimestampStyles.RelativeTime)
            : "Desconocido";

        const embed = {
            title: "Role deleted",
            description: [
                `> **Role:** ${role?.name || "Desconocido"}`,
                `> **ID:** \`${role?.id || "Desconocido"}\``,
                `> **Color:** ${role?.hexColor || "#000000"}`,
                `> **Created:** ${created}`
            ].join("\n"),
            color: 0xff0000,
            footer: {
                text: `${client.user.tag} • hoy a las ${new Date().toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit"
                })}`,
                icon_url: client.user.displayAvatarURL()
            }
        };


        if (channel?.send) {
            channel.send({ embeds: [embed] }).catch(console.error);
        } else {
            console.warn("⚠️ Canal de logs inválido:", channel?.id || "[objeto no válido]");
        }
    }
};
