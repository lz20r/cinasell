module.exports = {
    name: "autoModerationActionExecution",

    load(data, channel, client) {
        const guild = client.guilds.cache.get(data.guild?.id);
        
        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: " Acción de AutoMod Ejecutada",
            description: `Se ha ejecutado una acción de AutoMod`,
            timestamp: new Date(),
            color: 0xff0000,
            fields: [],
            footer: { text: "Sistema AutoMod" },
        };

        embed.fields.push({
            name: " Usuario Afectado",
            value: `<@${data.target.user_id}>`,
            inline: true
        });

        embed.fields.push({
            name: " Canal",
            value: `<#${data.target.channel_id}>`,
            inline: true
        });

        embed.fields.push({
            name: " Regla Disparada",
            value: `\`${data.target.rule_id}\``,
            inline: true
        });

        const actionTypes = {
            1: "Bloquear Mensaje",
            2: "Enviar Alerta",
            3: "Aislar Usuario"
        };

        embed.fields.push({
            name: " Acción Ejecutada",
            value: actionTypes[data.target.action?.type] || "Acción Desconocida",
            inline: true
        });

        if (data.target.rule_trigger_type) {
            const triggerTypes = {
                1: "Palabra Clave",
                2: "Spam Dañino",
                3: "Contenido de Palabra Clave Preestablecido",
                4: "Menciones Excesivas"
            };
            
            embed.fields.push({
                name: " Tipo de Disparador",
                value: triggerTypes[data.target.rule_trigger_type] || "Desconocido",
                inline: true
            });
        }

        if (data.target.content) {
            embed.fields.push({
                name: " Contenido Detectado",
                value: data.target.content.length > 1024 ? 
                    data.target.content.substring(0, 1021) + "..." : 
                    data.target.content,
                inline: false
            });
        }

        if (data.target.matched_keyword) {
            embed.fields.push({
                name: " Palabra Clave Coincidente",
                value: `\`${data.target.matched_keyword}\``,
                inline: true
            });
        }

        client.channels.cache.get(channel).send({ embeds: [embed] });
    }
};
