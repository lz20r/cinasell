module.exports = {
    name: "memberBanRemove",

    load(data, channel, client) {
        const guild = client.guilds.cache.get(data.guild?.id);
        const unbannedUser = data.target;
        
        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: " Usuario Desbaneado",
            description: `El usuario **${unbannedUser.tag}** ha sido desbaneado del servidor`,
            timestamp: new Date(),
            color: 0x00ff00,
            fields: [],
            footer: { text: `Desbaneado por: ${data.executor?.tag || "Sistema"}` },
            thumbnail: { url: unbannedUser.displayAvatarURL({ dynamic: true }) }
        };

        embed.fields.push({
            name: " Usuario Desbaneado",
            value: `${unbannedUser.tag} (${unbannedUser.id})`,
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
            value: `<t:${Math.floor(unbannedUser.createdTimestamp / 1000)}:F>`,
            inline: true
        });

        client.channels.cache.get(channel).send({ embeds: [embed] });
    }
};
