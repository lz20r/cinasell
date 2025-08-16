const { Profile }  = require('discord-arts');
const { resolveColor, AttachmentBuilder } = require("discord.js");
const Welcome = require("../models/welcome");
const AutoRole = require("../models/autoRole");

module.exports = {
  name: "guildMemberAdd",

  async load(member, client) {
    const { guild } = member;

    try {
      //  AUTOROL: Asignar rol automático si está configurado
      await handleAutoRole(member);

      //  WELCOME: Sistema de bienvenida existente
      const welcome = await Welcome.findOne({ where: { guildId: guild.id } });
      if (!welcome) return;

      
      const guildIconURL = guild.iconURL({ extension: 'png' });
      let buffer = null;

      if(guildIconURL) {
        buffer = await Profile(member.id, {
            borderColor: ['#00ff00', '#00aaff'],
            customBackground: guildIconURL,
            presenceStatus: 'online',
            removeAvatarFrame: true,
        });
      }

      // Personalizar el mensaje de bienvenida
      let welcomeMessage = welcome.message
        .replace(/\[user\]/gi, member.user.username)
        .replace(/\[server\]/gi, guild.name)
        .replace(/\[count\]/gi, guild.memberCount);


      const embed = {
        title: welcome.title || "¡Bienvenido!",
        description: welcomeMessage.trim().replace("{user}", member.user.username),
        color: resolveColor(welcome.color || 0x00FF00),
        timestamp: new Date().toISOString(),
      };

      const paramsMessage = { content: `¡Bienvenido **${member.user.tag}** al servidor!`, embeds: [embed]}

      if(buffer) {
        const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
        embed.image =  { url: "attachment://welcome.png" };
        paramsMessage.files = [attachment]
      }

      // Enviar el mensaje de bienvenida en el canal configurado
      const channel = client.channels.cache.get(welcome.channel);
      if (!channel) {
        console.error(`Channel not found: ${welcome.channel}`);
        return;
      }

      await channel.send(paramsMessage);
    } catch (error) {
      console.error("Error en el evento guildMemberAdd:", error);
    }
  },
};

//  Función para manejar el autorol
async function handleAutoRole(member) {
  try {
    const autoRole = await AutoRole.findOne({
      where: { 
        guildId: member.guild.id,
        enabled: true
      }
    });

    if (!autoRole) return; // No hay autorol configurado

    const role = member.guild.roles.cache.get(autoRole.roleId);
    if (!role) {
      console.warn(` AutoRole: Rol ${autoRole.roleId} no encontrado en ${member.guild.name}`);
      return;
    }

    // Verificar que el bot puede asignar el rol
    const botMember = member.guild.members.me;
    if (role.position >= botMember.roles.highest.position) {
      console.warn(` AutoRole: No puedo asignar ${role.name} - está por encima de mi rol más alto`);
      return;
    }

    // Asignar el rol al nuevo miembro
    await member.roles.add(role, 'Sistema de AutoRole');
    console.log(` AutoRole: Asignado rol "${role.name}" a ${member.user.tag} en ${member.guild.name}`);

  } catch (error) {
    console.error("Error en handleAutoRole:", error);
  }
}
