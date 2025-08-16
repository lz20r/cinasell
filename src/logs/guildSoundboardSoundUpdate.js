module.exports = {
    name: "guildSoundboardSoundUpdate",

    load(data, channel, client) {
        const guild = client.guilds.cache.get(data.guild?.id);
        const sound = data.target;
        
        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: " Sonido del Panel Actualizado",
            description: `El sonido **${sound.name}** del panel de sonidos ha sido actualizado`,
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

                case "volume":
                    field.name = " Volumen";
                    field.value = `Anterior: ${change.old}\nNuevo: ${change.new}`;
                    break;

                case "emoji_id":
                    field.name = " Emoji";
                    const oldEmoji = change.old ? guild.emojis.cache.get(change.old)?.name || change.old : "Sin emoji";
                    const newEmoji = change.new ? guild.emojis.cache.get(change.new)?.name || change.new : "Sin emoji";
                    field.value = `Anterior: ${oldEmoji}\nNuevo: ${newEmoji}`;
                    break;

                case "emoji_name":
                    field.name = " Nombre del Emoji";
                    field.value = `Anterior: ${change.old || "Sin emoji"}\nNuevo: ${change.new || "Sin emoji"}`;
                    break;

                case "available":
                    field.name = " Disponible";
                    field.value = `Anterior: ${change.old ? "Sí" : "No"}\nNuevo: ${change.new ? "Sí" : "No"}`;
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
