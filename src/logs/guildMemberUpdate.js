const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "guildMemberUpdate",

    async load(oldMember, newMember, canal, client) {
        if (!canal) return;

        const oldRoles = new Set(oldMember.roles.cache.map(r => r.id));
        const newRoles = new Set(newMember.roles.cache.map(r => r.id));

        const added = [...newRoles].filter(id => !oldRoles.has(id));
        const removed = [...oldRoles].filter(id => !newRoles.has(id));

        if (added.length === 0 && removed.length === 0) return;

        let title = "";
        let lines = [];
        let color = 0x5865f2;

        if (added.length > 0 && removed.length > 0) {
            title = "User roles updated";
            color = 0x3498db;
            lines = [
                `> User: ${newMember.user} (\`${newMember.user.tag}\`)`,
                `> Created: <t:${Math.floor(newMember.user.createdTimestamp / 1000)}:R>`,
                `> Added: ${added.map(id => `<@&${id}>`).join(" ")}`,
                `> Removed: ${removed.map(id => `<@&${id}>`).join(" ")}`,
                `> Reason: Role change`
            ];
        } else if (added.length > 0) {
            title = "User roles added";
            color = 0x00ff80;
            lines = [
                `> User: ${newMember.user} (\`${newMember.user.tag}\`)`,
                `> Created: <t:${Math.floor(newMember.user.createdTimestamp / 1000)}:R>`,
                `> Added: ${added.map(id => `<@&${id}>`).join(" ")}`,
                `> Reason: Role assigned`
            ];
        } else if (removed.length > 0) {
            title = "User roles removed";
            color = 0xff4d4d;
            lines = [
                `> User: ${newMember.user} (\`${newMember.user.tag}\`)`,
                `> Created: <t:${Math.floor(newMember.user.createdTimestamp / 1000)}:R>`,
                `> Removed: ${removed.map(id => `<@&${id}>`).join(" ")}`,
                `> Reason: Role removed`
            ];
        }

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor(color)
            .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
            .setDescription(lines.join("\n"))
            .setFooter({
                text: `${client.user?.tag || "Bot"} • hoy a las ${formatHour(new Date())}`,
                iconURL: client.user?.displayAvatarURL() || null
            });

        canal.send({ embeds: [embed] }).catch(console.error);
    }
};

function formatHour(date) {
    return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}
