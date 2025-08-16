const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "messageUpdate",

    load(data, channel, client) {
        const message = data.target;
        if (!message?.author) return;

        const channelObj = typeof channel === "string" ? client.channels.cache.get(channel) : channel;
        if (!channelObj) return;

        if (message.author.bot) return;
        if (!data.changes || data.changes.length === 0) return;

        const contentChange = data.changes.find(c => c.key === "content");
        if (!contentChange) return;

        const oldContent = contentChange.old || "*(Sin contenido)*";
        const newContent = contentChange.new || "*(Sin contenido)*";
        const timestamp = `<t:${Math.floor(Date.now() / 1000)}:R>`;

        const embed = new EmbedBuilder()
            .setColor(0xffd93d)
            .setAuthor({ name: "Message edited" })
            .setDescription([
                `> **Channel:** <#${channelObj.id}> \`#${channelObj.name}\``,
                `> **Message ID:** \`${message.id}\``,
                `> **Message author:** <@${message.author.id}>`,
                `> **Message created:** ${timestamp}`
            ].join('\n'))
            .addFields(
                {
                    name: "Before",
                    value: `\`\`\`\n${trimContent(oldContent)}\n\`\`\``,
                    inline: true
                },
                {
                    name: "After",
                    value: `\`\`\`\n${trimContent(newContent)}\n\`\`\``,
                    inline: true
                }
            )
            .setFooter({
                text: `Autor: ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
            });

        channelObj.send({ embeds: [embed] }).catch(console.error);
    }
};

function trimContent(text) {
    return text.length > 1000 ? text.slice(0, 997) + "..." : text;
}
