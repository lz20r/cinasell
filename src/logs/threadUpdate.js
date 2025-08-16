module.exports = {
    name: "threadUpdate",

    load(data, channel, client) {
        const guild = client.guilds.cache.get(data.guild?.id);
        const thread = data.target;
        
        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: " Hilo Actualizado",
            description: `El hilo **${thread.name}** ha sido actualizado`,
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

                case "archived":
                    field.name = " Archivado";
                    field.value = `Anterior: ${change.old ? "Sí" : "No"}\nNuevo: ${change.new ? "Sí" : "No"}`;
                    break;

                case "locked":
                    field.name = " Bloqueado";
                    field.value = `Anterior: ${change.old ? "Sí" : "No"}\nNuevo: ${change.new ? "Sí" : "No"}`;
                    break;

                case "auto_archive_duration":
                    field.name = " Archivo Automático";
                    const durations = {
                        60: "1 hora",
                        1440: "1 día",
                        4320: "3 días",
                        10080: "1 semana"
                    };
                    field.value = `Anterior: ${durations[change.old] || change.old + " minutos"}\nNuevo: ${durations[change.new] || change.new + " minutos"}`;
                    break;

                case "rate_limit_per_user":
                    field.name = " Modo Lento";
                    field.value = `Anterior: ${change.old || 0} segundos\nNuevo: ${change.new || 0} segundos`;
                    break;

                case "flags":
                    field.name = " Banderas";
                    field.value = `Anteriores: ${change.old || 0}\nNuevas: ${change.new || 0}`;
                    break;

                case "applied_tags":
                    field.name = " Etiquetas Aplicadas";
                    field.value = "Las etiquetas del hilo han sido modificadas";
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
