const tools = require("../tools/#export");
const fs = require("fs/promises");

module.exports = async (client) => {
  const folder = await fs.readdir("./src/logs");

  for (const file of folder) {
    if (!file.endsWith(".js")) continue;

    const log = require(`../logs/${file}`);

    client.on(log.name, async (...args) => {
      try {
        let guild = null;
        let guildId = null;

        // Determinar guild y guildId según el tipo de evento
        switch (log.name) {
          case "messageDelete":
          case "messageUpdate":
            guild = args[0]?.guild;
            guildId = args[0]?.guildId;
            break;

          case "guildMemberAdd":
          case "guildMemberRemove":
          case "guildMemberUpdate":
            guild = args[0]?.guild;
            guildId = args[0]?.guild?.id;
            break;

          case "voiceStateUpdate":
            guild = args[1]?.guild || args[0]?.guild;
            guildId = guild?.id;
            break;

          case "guildBanAdd":
          case "guildBanRemove":
          case "guildUpdate":
          case "roleCreate":
          case "roleDelete":
          case "roleUpdate":
          case "channelCreate":
          case "channelDelete":
          case "channelUpdate":
          case "threadCreate":
          case "threadDelete":
          case "threadUpdate":
          case "emojiCreate":
          case "emojiUpdate":
          case "emojiDelete":
          case "inviteCreate":
          case "inviteDelete":
            guild = args[0]?.guild;
            guildId = args[0]?.guild?.id;
            break;

          default:
            guild = args[0]?.guild;
            guildId = args[0]?.guild?.id;
            break;
        }

        if (!guild || !guildId) return;

        const isEnabled = await tools.isLogEnabled(guildId);

        if (!isEnabled) return;

        const canalLog = client.channels.cache.get(isEnabled.logChannel);
        if (!log.load) {
          console.error(`❌ El log ${log.name} no tiene un método load definido.`);
          return;
        }

        // Obtener audit logs si aplica
        let auditData = null;
        const eventsNeedingAudit = [
          "guildMemberRemove", "guildMemberUpdate", "guildBanAdd", "guildBanRemove",
          "roleCreate", "roleDelete", "roleUpdate", "channelCreate", "channelDelete",
          "channelUpdate", "threadDelete", "threadUpdate", "emojiCreate", "emojiUpdate",
          "emojiDelete", "inviteDelete", "guildUpdate", "messageDelete"
        ];

        if (eventsNeedingAudit.includes(log.name)) {
          try {
            const auditLogs = await guild.fetchAuditLogs({ limit: 1 });
            auditData = auditLogs.entries.first();
          } catch (error) {
            console.error(`Error fetching audit logs for ${log.name}:`, error);
          }
        }

        // Preparar logData para eventos genéricos
        let logData = null;

        switch (log.name) {
          case "voiceStateUpdate": {
            const oldState = args[0];
            const newState = args[1];

            logData = {
              target: newState.member,
              changes: []
            };

            if (oldState.channelId !== newState.channelId) {
              logData.changes.push({
                key: "channelId",
                old: oldState.channelId,
                new: newState.channelId
              });
            }
            if (oldState.mute !== newState.mute) {
              logData.changes.push({
                key: "mute",
                old: oldState.mute,
                new: newState.mute
              });
            }
            if (oldState.deaf !== newState.deaf) {
              logData.changes.push({
                key: "deaf",
                old: oldState.deaf,
                new: newState.deaf
              });
            }
            if (oldState.selfMute !== newState.selfMute) {
              logData.changes.push({
                key: "selfMute",
                old: oldState.selfMute,
                new: newState.selfMute
              });
            }
            if (oldState.selfDeaf !== newState.selfDeaf) {
              logData.changes.push({
                key: "selfDeaf",
                old: oldState.selfDeaf,
                new: newState.selfDeaf
              });
            }
            if (oldState.streaming !== newState.streaming) {
              logData.changes.push({
                key: "selfStream",
                old: oldState.streaming,
                new: newState.streaming
              });
            }
            if (oldState.selfVideo !== newState.selfVideo) {
              logData.changes.push({
                key: "selfVideo",
                old: oldState.selfVideo,
                new: newState.selfVideo
              });
            }
            break;
          }

          case "guildMemberUpdate": {
            const oldMember = args[0];
            const newMember = args[1];

            logData = {
              target: newMember,
              executor: auditData?.executor,
              changes: []
            };

            if (oldMember.nickname !== newMember.nickname) {
              logData.changes.push({
                key: "nick",
                old: oldMember.nickname,
                new: newMember.nickname
              });
            }
            if (oldMember.avatar !== newMember.avatar) {
              logData.changes.push({
                key: "avatar",
                old: oldMember.avatar,
                new: newMember.avatar
              });
            }
            if (oldMember.premiumSince !== newMember.premiumSince) {
              logData.changes.push({
                key: "premiumSince",
                old: oldMember.premiumSince,
                new: newMember.premiumSince
              });
            }
            if (oldMember.communicationDisabledUntil !== newMember.communicationDisabledUntil) {
              logData.changes.push({
                key: "communicationDisabledUntil",
                old: oldMember.communicationDisabledUntil,
                new: newMember.communicationDisabledUntil
              });
            }
            break;
          }

          case "messageDelete":
          case "messageUpdate": {
            const oldMessage = args[0];
            const newMessage = args[1];

            logData = {
              target: oldMessage,
              executor: auditData?.executor,
              changes: log.name === "messageUpdate" && newMessage ? [{
                key: "content",
                old: oldMessage.content,
                new: newMessage.content
              }] : []
            };
            break;
          }

          case "guildMemberAdd":
          case "guildMemberRemove": {
            logData = {
              target: args[0],
              executor: auditData?.executor
            };
            break;
          }

          default:
            logData = auditData || { target: args[0] };
            break;
        }

        // Ejecutar el log según el tipo de evento
        if (logData) {
          switch (log.name) {
            case "guildMemberUpdate": {
              const oldMember = args[0];
              const newMember = args[1];
              return log.load(oldMember, newMember, canalLog, client);
            }

            default:
              return log.load(logData, canalLog, client);
          }
        }
      } catch (error) {
        console.error(`Error en logs handler para evento ${log.name}:`, error);
      }
    });
  }

  console.log(`[LOGS] ${folder.length} eventos de logs cargados`);
};
