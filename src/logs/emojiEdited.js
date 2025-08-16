module.exports = {
    name: "emojiUpdate",

    load(data, channel, client) {
        const guild = client.channels.cache.get(channel)?.guild;
        const emoji = data.target;
        
        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: "✏️ Emoji Actualizado",
            description: `El emoji **${emoji.name}** ha sido actualizado`,
            timestamp: new Date(),
            color: 0xffff00,
            thumbnail: {
                url: emoji.url
            },
            fields: [],
            footer: { text: `Actualizado por: ${data.executor?.tag || "Sistema"}` },
        };

        for (const change of data.changes) {
            const field = {};

            switch (change.key) {
                case "name":
                    field.name = "🏷️ Nombre";
                    field.value = `Antiguo: \`${change.old}\`\nNuevo: \`${change.new}\``;
                    break;

                default:
                    continue;
            }

            embed.fields.push(field);
        }

        if (embed.fields.length > 0) {
            client.channels.cache.get(channel).send({ embeds: [embed] });
        }
    }
};