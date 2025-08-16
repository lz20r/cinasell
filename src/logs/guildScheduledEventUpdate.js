module.exports = {
    name: "guildScheduledEventUpdate",

    load(data, channel, client) {
        const guild = client.guilds.cache.get(data.guild?.id);
        const event = data.target;
        
        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: " Evento Programado Actualizado",
            description: `El evento **${event.name}** ha sido actualizado`,
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
                    field.value = `Anterior: \`${change.old}\`\nNuevo: \`${change.new}\``;
                    break;

                case "description":
                    field.name = " Descripción";
                    field.value = `Anterior: ${change.old || "Sin descripción"}\nNueva: ${change.new || "Sin descripción"}`;
                    break;

                case "channel_id":
                    field.name = " Canal";
                    const oldChannel = change.old ? guild.channels.cache.get(change.old)?.name || change.old : "Externo";
                    const newChannel = change.new ? guild.channels.cache.get(change.new)?.name || change.new : "Externo";
                    field.value = `Anterior: ${oldChannel}\nNuevo: ${newChannel}`;
                    break;

                case "entity_metadata":
                    field.name = " Ubicación";
                    const oldLocation = change.old?.location || "Sin ubicación";
                    const newLocation = change.new?.location || "Sin ubicación";
                    field.value = `Anterior: ${oldLocation}\nNueva: ${newLocation}`;
                    break;

                case "status":
                    field.name = " Estado";
                    const statuses = {
                        1: "Programado",
                        2: "Activo",
                        3: "Completado",
                        4: "Cancelado"
                    };
                    field.value = `Anterior: ${statuses[change.old] || change.old}\nNuevo: ${statuses[change.new] || change.new}`;
                    break;

                case "entity_type":
                    field.name = " Tipo";
                    const types = {
                        1: "Canal de Voz",
                        2: "Canal de Escenario",
                        3: "Ubicación Externa"
                    };
                    field.value = `Anterior: ${types[change.old] || change.old}\nNuevo: ${types[change.new] || change.new}`;
                    break;

                case "scheduled_start_time":
                    field.name = " Hora de Inicio";
                    field.value = `Anterior: <t:${Math.floor(new Date(change.old).getTime() / 1000)}:F>\nNueva: <t:${Math.floor(new Date(change.new).getTime() / 1000)}:F>`;
                    break;

                case "scheduled_end_time":
                    field.name = " Hora de Fin";
                    const oldEnd = change.old ? `<t:${Math.floor(new Date(change.old).getTime() / 1000)}:F>` : "Sin hora de fin";
                    const newEnd = change.new ? `<t:${Math.floor(new Date(change.new).getTime() / 1000)}:F>` : "Sin hora de fin";
                    field.value = `Anterior: ${oldEnd}\nNueva: ${newEnd}`;
                    break;

                case "privacy_level":
                    field.name = " Nivel de Privacidad";
                    const privacyLevels = {
                        2: "Solo miembros del servidor"
                    };
                    field.value = `Anterior: ${privacyLevels[change.old] || change.old}\nNuevo: ${privacyLevels[change.new] || change.new}`;
                    break;

                case "image":
                    field.name = " Imagen";
                    field.value = change.new ? "Imagen actualizada" : "Imagen removida";
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
