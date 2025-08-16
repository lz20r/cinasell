module.exports = {
    name: "memberTimeoutRemove",

    load(data, channel, client) {
        const guild = client.guilds.cache.get(data.guild?.id);
        const member = data.target;
        
        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: " Aislamiento Removido",
            description: `El aislamiento del usuario **${member.user?.tag}** ha sido removido`,
            timestamp: new Date(),
            color: 0x00ff00,
            fields: [],
            footer: { text: `Removido por: ${data.executor?.tag || "Sistema"}` },
            thumbnail: { url: member.user?.displayAvatarURL({ dynamic: true }) }
        };

        embed.fields.push({
            name: " Usuario",
            value: `${member.user?.tag} (${member.user?.id})`,
            inline: true
        });

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
