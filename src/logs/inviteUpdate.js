module.exports = {
    name: "inviteUpdate",

    load(data, channel, client) {
        const guild = client.guilds.cache.get(data.guild?.id);
        const invite = data.target;
        
        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: " Invitación Actualizada",
            description: `La invitación **${invite.code}** ha sido actualizada`,
            timestamp: new Date(),
            color: 0xffff00,
            fields: [],
            footer: { text: `Actualizada por: ${data.executor?.tag || "Sistema"}` },
        };

        for (const change of data.changes) {
            const field = {};

            switch (change.key) {
                case "max_age":
                    field.name = " Duración";
                    const oldAge = change.old === 0 ? "Nunca expira" : `${change.old / 3600} horas`;
                    const newAge = change.new === 0 ? "Nunca expira" : `${change.new / 3600} horas`;
                    field.value = `Anterior: ${oldAge}\nNueva: ${newAge}`;
                    break;

                case "max_uses":
                    field.name = " Usos Máximos";
                    field.value = `Anterior: ${change.old === 0 ? "Ilimitado" : change.old}\nNuevo: ${change.new === 0 ? "Ilimitado" : change.new}`;
                    break;

                case "temporary":
                    field.name = " Membresía Temporal";
                    field.value = `Anterior: ${change.old ? "Sí" : "No"}\nNueva: ${change.new ? "Sí" : "No"}`;
                    break;

                case "channel_id":
                    field.name = " Canal";
                    const oldChannel = change.old ? guild.channels.cache.get(change.old)?.name || change.old : "Canal desconocido";
                    const newChannel = change.new ? guild.channels.cache.get(change.new)?.name || change.new : "Canal desconocido";
                    field.value = `Anterior: ${oldChannel}\nNuevo: ${newChannel}`;
                    break;

                default:
                    field.name = ` ${change.key}`;
                    field.value = `Anterior: \`${change.old}\`\nNuevo: \`${change.new}\``;
                    break;
            }

            embed.fields.push(field);
        }

        if (embed.fields.length > 0) {
            client.channels.cache.get(channel).send({ embeds: [embed] });
        }
    }
};
