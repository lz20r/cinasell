module.exports = {
    name: "roleCreate",

    load(data, channel, client) {
        const role = data.target;

        const embed = {
            title: "Role created",
            description: [
                `> **Role:** ${role?.name || "Desconocido"} (${role?.toString?.() || "sin mención"})`,
                `> **ID:** \`${role?.id || "Desconocido"}\``
            ].join("\n"),
            color: 0x00ff00,
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
