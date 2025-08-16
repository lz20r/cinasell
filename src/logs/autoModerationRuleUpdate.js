module.exports = {
    name: "autoModerationRuleUpdate",

    load(data, channel, client) {
        const guild = client.guilds.cache.get(data.guild?.id);
        
        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: " Regla de AutoMod Actualizada",
            description: `La regla de AutoMod **${data.target.name}** ha sido actualizada`,
            timestamp: new Date(),
            color: 0xffff00,
            fields: [],
            footer: { text: `Actualizada por: ${data.executor?.tag || "Sistema"}` },
        };

        for (const change of data.changes) {
            const field = {};

            switch (change.key) {
                case "name":
                    field.name = " Nombre";
                    field.value = `Anterior: \`${change.old}\`\nNuevo: \`${change.new}\``;
                    break;

                case "enabled":
                    field.name = " Estado";
                    field.value = `Anterior: ${change.old ? "Habilitada" : "Deshabilitada"}\nNuevo: ${change.new ? "Habilitada" : "Deshabilitada"}`;
                    break;

                case "event_type":
                    field.name = " Tipo de Evento";
                    const eventTypes = {
                        1: "Envío de Mensaje"
                    };
                    field.value = `Anterior: ${eventTypes[change.old] || change.old}\nNuevo: ${eventTypes[change.new] || change.new}`;
                    break;

                case "trigger_type":
                    field.name = " Tipo de Disparador";
                    const triggerTypes = {
                        1: "Palabra Clave",
                        2: "Spam Dañino",
                        3: "Contenido de Palabra Clave Preestablecido",
                        4: "Menciones Excesivas"
                    };
                    field.value = `Anterior: ${triggerTypes[change.old] || change.old}\nNuevo: ${triggerTypes[change.new] || change.new}`;
                    break;

                case "trigger_metadata":
                    field.name = " Metadatos del Disparador";
                    field.value = "Los metadatos del disparador han sido modificados";
                    break;

                case "actions":
                    field.name = " Acciones";
                    field.value = "Las acciones de la regla han sido modificadas";
                    break;

                case "exempt_roles":
                    field.name = " Roles Exentos";
                    field.value = "Los roles exentos han sido modificados";
                    break;

                case "exempt_channels":
                    field.name = " Canales Exentos";
                    field.value = "Los canales exentos han sido modificados";
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
