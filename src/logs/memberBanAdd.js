module.exports = {
    name: "memberBanAdd",

    load(data, channel, client) {
        const guild = client.guilds.cache.get(data.guild?.id);
        const bannedUser = data.target;
        
        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: " Usuario Baneado",
            description: `El usuario **${bannedUser.tag}** ha sido baneado del servidor`,
            timestamp: new Date(),
            color: 0xff0000,
            fields: [],
            footer: { text: `Baneado por: ${data.executor?.tag || "Sistema"}` },
            thumbnail: { url: bannedUser.displayAvatarURL({ dynamic: true }) }
        };

        embed.fields.push({
            name: " Usuario Baneado",
            value: `${bannedUser.tag} (${bannedUser.id})`,
            inline: true
        });

        if (data.reason) {
            embed.fields.push({
                name: " Razón",
                value: data.reason,
                inline: false
            });
        }

        embed.fields.push({
            name: " Fecha de Creación de Cuenta",
            value: `<t:${Math.floor(bannedUser.createdTimestamp / 1000)}:F>`,
            inline: true
        });

        client.channels.cache.get(channel).send({ embeds: [embed] });
    }
};
