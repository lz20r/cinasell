module.exports = {
    name: "messagePinUpdate",

    load(data, channel, client) {
        const guild = client.guilds.cache.get(data.guild?.id);
        const targetChannel = guild?.channels.cache.get(data.target.id);
        
        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: " Mensaje Fijado/Desfijado",
            description: `Se ha ${data.changes[0]?.new ? "fijado" : "desfijado"} un mensaje en ${targetChannel}`,
            timestamp: new Date(),
            color: data.changes[0]?.new ? 0x00ff00 : 0xff9900,
            fields: [],
            footer: { text: `Por: ${data.executor?.tag || "Sistema"}` },
        };

        embed.fields.push({
            name: " Canal",
            value: `${targetChannel}`,
            inline: true
        });

        if (data.target.last_pin_timestamp) {
            embed.fields.push({
                name: " Último mensaje fijado",
                value: `<t:${Math.floor(new Date(data.target.last_pin_timestamp).getTime() / 1000)}:F>`,
                inline: true
            });
        }

        client.channels.cache.get(channel).send({ embeds: [embed] });
    }
};
