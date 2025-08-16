const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "messageDelete",

    load(data, channel, client) {
        const message = data.target;
        if (!message?.author) return;

        const channelObj = typeof channel === "string" ? client.channels.cache.get(channel) : channel;
        if (!channelObj) return;

        if (message.author.bot) return;

        const content = message.content || "*(Sin contenido)*";
        const timestamp = `<t:${Math.floor(Date.now() / 1000)}:R>`;

        const embed = new EmbedBuilder()
            .setColor(0xff4d4d)
            .setAuthor({ name: "Message deleted" })
            .setDescription([
                `> **Channel:** <#${channelObj.id}> \`#${channelObj.name}\``,
                `> **Message ID:** \`${message.id}\``,
                `> **Message author:** <@${message.author.id}>`,
                `> **Message created:** ${timestamp}`
            ].join("\n"))
            .addFields([
                {
                    name: "Content",
                    value: `\`\`\`\n${trimContent(content)}\n\`\`\``
                }
            ])
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
