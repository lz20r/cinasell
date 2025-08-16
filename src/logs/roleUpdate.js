const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "guildMemberUpdate",

    load(oldMember, newMember, channel, client) {
        const oldRoles = new Set(oldMember.roles.cache.map(r => r.id));
        const newRoles = new Set(newMember.roles.cache.map(r => r.id));

        const added = [...newRoles].filter(id => !oldRoles.has(id));
        const removed = [...oldRoles].filter(id => !newRoles.has(id));

        if (added.length === 0 && removed.length === 0) return;

        let title = "";
        let descriptionLines = [];
        let color = 0x5865f2;

        descriptionLines.push(`> **User:** ${newMember.user} (\`${newMember.user.tag}\`)`);
        descriptionLines.push(`> **Created:** <t:${Math.floor(newMember.user.createdTimestamp / 1000)}:R>`);

        if (added.length > 0 && removed.length > 0) {
            title = "User roles update";
            color = 0xf1c40f;
            descriptionLines.push(`> **Added:** ${added.map(id => `<@&${id}>`).join(", ")}`);
            descriptionLines.push(`> **Removed:** ${removed.map(id => `<@&${id}>`).join(", ")}`);
            descriptionLines.push(`> **Reason:** Join Roles`);
        } else if (added.length > 0) {
            title = "User roles added";
            color = 0x00ff80;
            descriptionLines.push(`> **Added:** ${added.map(id => `<@&${id}>`).join(", ")}`);
            descriptionLines.push(`> **Reason:** Join Roles`);
        } else if (removed.length > 0) {
            title = "User roles removed";
            color = 0xff4d4d;
            descriptionLines.push(`> **Removed:** ${removed.map(id => `<@&${id}>`).join(", ")}`);
            descriptionLines.push(`> **Reason:** Left Roles`);
        }

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor(color)
            .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
            .setDescription(descriptionLines.join("\n"))
            .setFooter({
                text: `${client.user.tag} • hoy a las ${formatHour(new Date())}`,
                iconURL: client.user.displayAvatarURL()
            });

        channel.send({ embeds: [embed] }).catch(console.error);
    }
};

function formatHour(date) {
    return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}
