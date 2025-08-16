const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "guildMemberRemove",

    async load(data, channel, client) {
        const member = data.target;
        const channelObj = typeof channel === "string" ? client.channels.cache.get(channel) : channel;
        const guild = channelObj?.guild;

        if (!member || !channelObj) return;

        let kicked = false;
        let executor = null;
        let reason = "No reason provided";

        // Audit logs para detectar si fue kick
        try {
            const auditLogs = await guild.fetchAuditLogs({ type: 20, limit: 1 }); // 20 = kick
            const entry = auditLogs.entries.first();

            if (
                entry &&
                entry.target?.id === member.id &&
                Date.now() - entry.createdTimestamp < 5000
            ) {
                kicked = true;
                executor = entry.executor;
                reason = entry.reason || reason;
            }
        } catch (e) {
            console.error("Error checking for kick:", e);
        }

        const roles = member.roles.cache
            .filter(r => r.id !== guild.id)
            .map(r => `<@&${r.id}>`)
            .join(" ") || "*Ninguno*";

        const embed = new EmbedBuilder()
            .setTitle(kicked ? `${member.user.tag} was kicked` : `${member.user.tag} left the server`)
            .setColor(kicked ? 0xff4d4d : 0xff3c00)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription([
                `> **User:** ${member.user} (\`${member.user.tag}\`)`,
                `> **ID:** \`${member.id}\``,
                `> **Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
                `> **Roles:** ${roles}`,
                `> **Members:** ${guild?.memberCount || "?"}`,
                kicked ? `> **Executor:** ${executor}` : null,
                kicked ? `> **Reason:** ${reason}` : null
            ].filter(Boolean).join("\n"))
            .setFooter({
                text: `${client.user.tag} • hoy a las ${formatHour(new Date())}`,
                iconURL: client.user.displayAvatarURL()
            });

        channelObj.send({ embeds: [embed] }).catch(console.error);
    }
};

function formatHour(date) {
    return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}
