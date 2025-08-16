module.exports = {
    name: "channelDelete",

    load(data, channel, client) {
        const guild = client.guilds.cache.get(data.guild?.id);
        const deletedChannel = data.target;

        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: " Canal Eliminado",
            description: `Se ha eliminado el canal **#${deletedChannel.name}**`,
            timestamp: new Date(),
            color: 0xff0000,
            fields: [
                {
                    name: " Nombre",
                    value: `\`${deletedChannel.name}\``,
                    inline: true
                },
                {
                    name: " ID",
                    value: `\`${deletedChannel.id}\``,
                    inline: true
                },
                {
                    name: " Tipo",
                    value: deletedChannel.type === 0 ? "Texto" : deletedChannel.type === 2 ? "Voz" : "Otro",
                    inline: true
                }
            ],
            footer: { text: `Eliminado por: ${data.executor?.tag || "Sistema"}` },
        };

        if (deletedChannel.topic) {
            embed.fields.push({
                name: " Tema",
                value: `\`${deletedChannel.topic}\``,
                inline: false
            });
        }

        client.channels.cache.get(channel).send({ embeds: [embed] });
    }
};
