const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "voiceStateUpdate",

    async load(data, channelId, client) {
        const guild = client.guilds.cache.get(data.guild?.id);
        const member = data.target;
        const user = member?.user;
        const logChannel = client.channels.cache.get(channelId);

        if (!guild || !member || !user || !logChannel) return;

        const oldChannel = data.old?.channel;
        const newChannel = data.new?.channel;

        let embed = new EmbedBuilder()
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setFooter({
                text: `hoy a las ${formatHour(new Date())}`,
                iconURL: client.user.displayAvatarURL(),
            });

        // JOIN
        if (!data.old?.channelId && data.new?.channelId) {
            embed
                .setTitle("User joined channel")
                .setColor(0x57f287)
                .setDescription([
                    `> **User:** <@${user.id}> ([${user.username}](https://discord.com/users/${user.id}))`,
                    `> **Channel:** 🔊 ${newChannel?.name || "Desconocido"}`,
                    `> **Users:** ${newChannel?.members?.size || 0}/∞`
                ].join("\n"));
        }

        // LEAVE
        else if (data.old?.channelId && !data.new?.channelId) {
            embed
                .setTitle("User left channel")
                .setColor(0xed4245)
                .setDescription([
                    `> **User:** <@${user.id}> ([${user.username}](https://discord.com/users/${user.id}))`,
                    `> **Channel:** 🔊 ${oldChannel?.name || "Desconocido"}`,
                    `> **Users:** ${oldChannel?.members?.size || 0}/∞`
                ].join("\n"));
        }

        // MOVE (opcional)
        else if (data.old?.channelId !== data.new?.channelId) {
            embed
                .setTitle("User moved channel")
                .setColor(0x3498db)
                .setDescription([
                    `> **User:** <@${user.id}> ([${user.username}](https://discord.com/users/${user.id}))`,
                    `> **From:** 🔊 ${oldChannel?.name || "?"}`,
                    `> **To:** 🔊 ${newChannel?.name || "?"}`,
                    `> **Users in new:** ${newChannel?.members?.size || 0}/∞`
                ].join("\n"));
        } else {
            return; // No relevante
        }

        logChannel.send({ embeds: [embed] }).catch(console.error);
    }
};

function formatHour(date) {
    return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}
