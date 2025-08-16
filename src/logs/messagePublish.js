module.exports = {
    name: "messagePublish",

    load(data, channel, client) {
        const guild = client.guilds.cache.get(data.guild?.id);
        const targetChannel = guild?.channels.cache.get(data.target.channel_id);
        
        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: " Mensaje Publicado",
            description: `Un mensaje ha sido publicado desde ${targetChannel}`,
            timestamp: new Date(),
            color: 0x00ff00,
            fields: [],
            footer: { text: `Publicado por: ${data.executor?.tag || "Sistema"}` },
        };

        embed.fields.push({
            name: " Canal de Origen",
            value: `${targetChannel}`,
            inline: true
        });

        embed.fields.push({
            name: " ID del Mensaje",
            value: `\`${data.target.id}\``,
            inline: true
        });

        if (data.target.content) {
            embed.fields.push({
                name: " Contenido",
                value: data.target.content.length > 1024 ? 
                    data.target.content.substring(0, 1021) + "..." : 
                    data.target.content,
                inline: false
            });
        }

        client.channels.cache.get(channel).send({ embeds: [embed] });
    }
};
