module.exports = {
    name: "memberTimeoutAdd",

    load(data, channel, client) {
        const guild = client.guilds.cache.get(data.guild?.id);
        const member = data.target;
        
        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: " Usuario Aislado (Timeout)",
            description: `El usuario **${member.user?.tag}** ha sido aislado`,
            timestamp: new Date(),
            color: 0xff9900,
            fields: [],
            footer: { text: `Aislado por: ${data.executor?.tag || "Sistema"}` },
            thumbnail: { url: member.user?.displayAvatarURL({ dynamic: true }) }
        };

        embed.fields.push({
            name: " Usuario Aislado",
            value: `${member.user?.tag} (${member.user?.id})`,
            inline: true
        });

        if (data.changes && data.changes[0] && data.changes[0].new) {
            embed.fields.push({
                name: " Aislado Hasta",
                value: `<t:${Math.floor(new Date(data.changes[0].new).getTime() / 1000)}:F>`,
                inline: true
            });
        }

        if (data.reason) {
            embed.fields.push({
                name: " Razón",
                value: data.reason,
                inline: false
            });
        }

        client.channels.cache.get(channel).send({ embeds: [embed] });
    }
};
