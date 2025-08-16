const { Op, Sequelize } = require("sequelize");
const StickiedMsg = require("../models/stickiedMsg");
const AutoResponder = require("../models/autoResponder");

module.exports = {
  name: "messageCreate",

  async load(message, client) {
    const { author, content, channel, guild, member } = message;
    this.command(message, client);

    // 🛑 Ignorar mensajes de bots y mensajes en MD
    if (author.bot || !guild) return;

    try {
      // 🔹 Verificar permisos del bot para eliminar mensajes
      if (!channel.permissionsFor(guild.members.me).has("ManageMessages")) {
        console.warn("⚠️ El bot no tiene permisos para eliminar mensajes en este canal.");
      } 

      // 🔹 Verificar si el canal tiene sticked-message

      const hasStickiedMessge = await StickiedMsg.findOne({where: {channel: channel.id}})
      if(hasStickiedMessge) {
        const contentStickiedMessage = hasStickiedMessge.dataValues?.message // Envía el mensaje si existe
        const oldStickiedMessage = (await channel.messages.fetch({limit: 10})).find( // Elimina el mensaje anterior si existe
          (msg) => msg.content === contentStickiedMessage && msg.author.id === client.user.id
        );


        if(contentStickiedMessage && oldStickiedMessage) {
          oldStickiedMessage.delete()
          channel.send({content: contentStickiedMessage})
        }
      }

      // 🔹 Verificar si el usuario usó `{delete}`
      const shouldDelete = content.startsWith("{delete}");
      const cleanContent = content.replace("{delete}", "").trim();

      //console.log(`🔍 Buscando autoresponder para: "${cleanContent}" en ${guild.id}`);

      // 🔹 Buscar autoresponders que coincidan exactamente o parcialmente
      const responder = await AutoResponder.findOne({
        where: {
          guildId: guild.id,
          [Op.or]: [
            { trigger_text: cleanContent },
            { wildcards: true, trigger_text: { [Op.substring]: cleanContent } }
          ]
        }
      });

      // 🔹 Si hay autoresponder, manejar la respuesta
      if (responder) {
        // 🔥 Elimina el mensaje del usuario si `delete_after = true` o si usó `{delete}`
        if (responder.delete_after || shouldDelete) {
          console.log(`🗑 Eliminando mensaje de ${author.username}`);

          try {
            await message.delete();
          } catch (error) {
            console.error("❌ Error eliminando el mensaje del usuario:", error);
          }
        }

        // 🔹 Enviar la respuesta automática
        const reply = await channel.send(responder.response);

        // 🔥 Eliminar la respuesta automática después de 5 segundos si `delete_after = true`
        if (responder.delete_after || shouldDelete) {
          console.log("⏳ Eliminando mensaje del bot en 5s...");
          setTimeout(async () => {
            try {
              await reply.delete();
            } catch (error) {
              console.error("❌ Error eliminando el mensaje del bot:", error);
            }
          }, 5000);
        }
      }
    } catch (error) {
      console.error("❌ Error en messageCreate:", error);
    }
  },

  async command (message, client) {
    const prefix = client.config.prefix;
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.prefix.get(commandName)
    if (!command) return;
    command.execute(client, message, args).catch(err => {
      console.error("❌ Error al ejecutar el comando:", err);
    });
  }
};
