module.exports = {
    name: "webhookUpdate",

    load(data, channel, client) {
        const guild = client.guilds.cache.get(data.guild?.id);
        const webhook = data.target;
        
        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: " Webhook Actualizado",
            description: `El webhook **${webhook.name || "Sin nombre"}** ha sido actualizado`,
            timestamp: new Date(),
            color: 0xffff00,
            fields: [],
            footer: { text: `Actualizado por: ${data.executor?.tag || "Sistema"}` },
        };

        for (const change of data.changes) {
            const field = {};

            switch (change.key) {
                case "name":
                    field.name = " Nombre";
                    field.value = `Anterior: \`${change.old || "Sin nombre"}\`\nNuevo: \`${change.new || "Sin nombre"}\``;
                    break;

                case "channel_id":
                    field.name = " Canal";
                    const oldChannel = change.old ? guild.channels.cache.get(change.old)?.name || change.old : "Canal desconocido";
                    const newChannel = change.new ? guild.channels.cache.get(change.new)?.name || change.new : "Canal desconocido";
                    field.value = `Anterior: ${oldChannel}\nNuevo: ${newChannel}`;
                    break;

                case "avatar":
                    field.name = " Avatar";
                    field.value = change.new ? "Avatar actualizado" : "Avatar removido";
                    break;

                case "application_id":
                    field.name = " ID de Aplicación";
                    field.value = `Anterior: ${change.old || "Ninguna"}\nNueva: ${change.new || "Ninguna"}`;
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
