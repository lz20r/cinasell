const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "guildMemberAdd",

    async load(data, channel, client) {
        const member = data.target;
        const channelObj = client.channels.cache.get(channel);
        const guild = channelObj?.guild;

        if (!member || !channelObj || !guild) return;

        await guild.members.fetch(); // asegura que la lista esté completa

        const totalMembers = guild.memberCount;
        const users = guild.members.cache.filter(m => !m.user.bot).size;
        const bots = guild.members.cache.filter(m => m.user.bot).size;

        const embed = new EmbedBuilder()
            .setTitle("User joined")
            .setColor(0x00ff80)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription([
                `> User: ${member.user} (\`${member.user.tag}\`)`,
                `> ID: \`${member.id}\``,
                `> Created: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
                `> Members: ${users} users, ${bots} bots (total: ${totalMembers})`
            ].join("\n"))
            .setFooter({
                text: `${client.user.tag} • hoy a las ${formatHour(new Date())}`,
                iconURL: client.user.displayAvatarURL()
            });

        channelObj.send({ embeds: [embed] });
    }
};

function formatHour(date) {
    return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}
