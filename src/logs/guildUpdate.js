module.exports = {
    name: "guildUpdate",

    load(data, channel, client) {
        const guild = client.guilds.cache.get(data.guild?.id);
        
        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: " Servidor Actualizado",
            description: `El servidor **${guild?.name}** ha sido actualizado`,
            timestamp: new Date(),
            color: 0x00ff00,
            fields: [],
            footer: { text: `Actualizado por: ${data.executor?.tag || "Sistema"}` },
        };

        for (const change of data.changes) {
            const field = {};

            switch (change.key) {
                case "name":
                    field.name = " Nombre del Servidor";
                    field.value = `Antiguo: \`${change.old}\`\nNuevo: \`${change.new}\``;
                    break;

                case "icon":
                    field.name = " Icono del Servidor";
                    field.value = change.new ? "Icono actualizado" : "Icono removido";
                    break;

                case "banner":
                    field.name = " Banner del Servidor";
                    field.value = change.new ? "Banner actualizado" : "Banner removido";
                    break;

                case "splash":
                    field.name = " Splash de Invitación";
                    field.value = change.new ? "Splash actualizado" : "Splash removido";
                    break;

                case "discovery_splash":
                    field.name = " Splash de Descubrimiento";
                    field.value = change.new ? "Splash de descubrimiento actualizado" : "Splash de descubrimiento removido";
                    break;

                case "owner_id":
                    field.name = " Propietario";
                    const oldOwner = guild.members.cache.get(change.old)?.user?.tag || change.old;
                    const newOwner = guild.members.cache.get(change.new)?.user?.tag || change.new;
                    field.value = `Anterior: ${oldOwner}\nNuevo: ${newOwner}`;
                    break;

                case "region":
                    field.name = " Región";
                    field.value = `Antigua: ${change.old}\nNueva: ${change.new}`;
                    break;

                case "afk_channel_id":
                    field.name = " Canal AFK";
                    const oldAfk = change.old ? guild.channels.cache.get(change.old)?.name || change.old : "Ninguno";
                    const newAfk = change.new ? guild.channels.cache.get(change.new)?.name || change.new : "Ninguno";
                    field.value = `Anterior: ${oldAfk}\nNuevo: ${newAfk}`;
                    break;

                case "afk_timeout":
                    field.name = " Tiempo AFK";
                    field.value = `Anterior: ${change.old / 60} minutos\nNuevo: ${change.new / 60} minutos`;
                    break;

                case "verification_level":
                    field.name = " Nivel de Verificación";
                    const levels = ["Ninguno", "Bajo", "Medio", "Alto", "Muy Alto"];
                    field.value = `Anterior: ${levels[change.old] || change.old}\nNuevo: ${levels[change.new] || change.new}`;
                    break;

                case "default_message_notifications":
                    field.name = " Notificaciones por Defecto";
                    const notifTypes = ["Todos los mensajes", "Solo menciones"];
                    field.value = `Anterior: ${notifTypes[change.old] || change.old}\nNuevo: ${notifTypes[change.new] || change.new}`;
                    break;

                case "explicit_content_filter":
                    field.name = " Filtro de Contenido Explícito";
                    const filters = ["Deshabilitado", "Miembros sin roles", "Todos los miembros"];
                    field.value = `Anterior: ${filters[change.old] || change.old}\nNuevo: ${filters[change.new] || change.new}`;
                    break;

                case "mfa_level":
                    field.name = " Nivel 2FA";
                    const mfaLevels = ["Deshabilitado", "Habilitado"];
                    field.value = `Anterior: ${mfaLevels[change.old] || change.old}\nNuevo: ${mfaLevels[change.new] || change.new}`;
                    break;

                case "vanity_url_code":
                    field.name = " URL Personalizada";
                    field.value = `Anterior: ${change.old || "Ninguna"}\nNueva: ${change.new || "Ninguna"}`;
                    break;

                case "description":
                    field.name = " Descripción";
                    field.value = `Anterior: ${change.old || "Sin descripción"}\nNueva: ${change.new || "Sin descripción"}`;
                    break;

                case "preferred_locale":
                    field.name = " Idioma Preferido";
                    field.value = `Anterior: ${change.old}\nNuevo: ${change.new}`;
                    break;

                case "premium_tier":
                    field.name = " Nivel Premium";
                    field.value = `Anterior: Nivel ${change.old}\nNuevo: Nivel ${change.new}`;
                    break;

                case "premium_subscription_count":
                    field.name = " Boosts del Servidor";
                    field.value = `Anterior: ${change.old} boosts\nNuevo: ${change.new} boosts`;
                    break;

                case "system_channel_id":
                    field.name = " Canal del Sistema";
                    const oldSystem = change.old ? guild.channels.cache.get(change.old)?.name || change.old : "Ninguno";
                    const newSystem = change.new ? guild.channels.cache.get(change.new)?.name || change.new : "Ninguno";
                    field.value = `Anterior: ${oldSystem}\nNuevo: ${newSystem}`;
                    break;

                case "rules_channel_id":
                    field.name = " Canal de Reglas";
                    const oldRules = change.old ? guild.channels.cache.get(change.old)?.name || change.old : "Ninguno";
                    const newRules = change.new ? guild.channels.cache.get(change.new)?.name || change.new : "Ninguno";
                    field.value = `Anterior: ${oldRules}\nNuevo: ${newRules}`;
                    break;

                case "public_updates_channel_id":
                    field.name = " Canal de Actualizaciones Públicas";
                    const oldUpdates = change.old ? guild.channels.cache.get(change.old)?.name || change.old : "Ninguno";
                    const newUpdates = change.new ? guild.channels.cache.get(change.new)?.name || change.new : "Ninguno";
                    field.value = `Anterior: ${oldUpdates}\nNuevo: ${newUpdates}`;
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
