const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset-estructura')
    .setDescription('Borra todo y crea la estructura bilingüe con roles y permisos'),

  async execute(interaction) {
    const guild = interaction.guild;
    await interaction.reply('⚠ Reseteando servidor...');

    const rolesProtegidos = [
      guild.roles.everyone.id,
      ...guild.members.me.roles.cache.map(r => r.id) // Protege los roles del bot
    ];

    // 1. BORRAR CANALES
    for (const channel of guild.channels.cache.values()) {
      try {
        await channel.delete();
      } catch (e) {
        console.log(`❌ No se pudo eliminar canal ${channel.name}: ${e.message}`);
      }
    }

    // 2. BORRAR ROLES (excepto protegidos)
    for (const role of guild.roles.cache.values()) {
      if (!rolesProtegidos.includes(role.id)) {
        try {
          await role.delete();
        } catch (e) {
          console.log(`❌ No se pudo eliminar rol ${role.name}: ${e.message}`);
        }
      }
    }

    // 3. Crear roles necesarios
    const nombresRoles = [
      "Learner", "Trial Support", "Support", "Moderator", "Junior Admin",
      "Admin", "Senior Admin", "Manager", "Coordinator", "Platform Admin",
      "Director", "Community Manager", "Operator"
    ];

    const rolesMap = {};
    for (const nombre of nombresRoles) {
      const rol = await guild.roles.create({
        name: nombre,
        reason: 'Creación desde reset-estructura'
      });
      rolesMap[nombre] = rol.id;
    }

    // 4. Estructura con permisos
    const estructura = {
      "📢 Información / Info": {
        canales: ["📌│reglas-rules", "📖│guía-guide", "🗂│estructura-structure", "🎨│roles-colors", "📝│formularios-forms"],
        permisos: [
          { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.SendMessages] },
          { id: rolesMap["Learner"], allow: [PermissionsBitField.Flags.SendMessages] }
        ]
      },
      "👥 Comunidad / Community": {
        canales: ["💬│general", "🎉│bienvenida-welcome", "🧠│faq", "🚫│reportes-reports"],
        permisos: [
          { id: guild.roles.everyone.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
        ]
      },
      "🧪 Departamento Learners / Learners Dept": {
        canales: ["👶│inicio-start", "📋│tareas-tasks", "❓│dudas-questions"],
        permisos: [
          { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          ...["Learner", "Trial Support", "Support", "Moderator"]
            .map(r => ({ id: rolesMap[r], allow: [PermissionsBitField.Flags.ViewChannel] }))
        ]
      },
      "🔍 Verificación / Verification Dept": {
        canales: ["📥│solicitudes-requests", "🕵│pendientes-pending", "📊│estado-status"],
        permisos: [
          { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          ...["Trial Support", "Support", "Manager"]
            .map(r => ({ id: rolesMap[r], allow: [PermissionsBitField.Flags.ViewChannel] }))
        ]
      },
      "🔁 Recambios / Replacements": {
        canales: ["♻│gestión-management", "📦│reposiciones-restocks", "✅│completado-completed"],
        permisos: [
          { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          ...["Moderator", "Junior Admin"]
            .map(r => ({ id: rolesMap[r], allow: [PermissionsBitField.Flags.ViewChannel] }))
        ]
      },
      "🏢 Administrativo / Admin Dept": {
        canales: ["🧾│pedidos-orders", "💼│informes-logs", "📅│agenda-calendar"],
        permisos: [
          { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          ...["Admin", "Senior Admin"]
            .map(r => ({ id: rolesMap[r], allow: [PermissionsBitField.Flags.ViewChannel] }))
        ]
      },
      "🧠 Directiva / Management": {
        canales: ["📣│anuncios-announcements", "🧩│reuniones-meetings", "📊│coordinación-coordination", "👑│directiva-board"],
        permisos: [
          { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          ...["Manager", "Coordinator", "Platform Admin", "Director", "Community Manager", "Operator"]
            .map(r => ({ id: rolesMap[r], allow: [PermissionsBitField.Flags.ViewChannel] }))
        ]
      },
      "🔒 Staff Privado / Private Staff": {
        canales: ["🧑‍🏫│formación-training", "🎯│evaluaciones-evaluations", "🎓│ascensos-promotions"],
        permisos: [
          { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          ...Object.values(rolesMap).map(id => ({ id, allow: [PermissionsBitField.Flags.ViewChannel] }))
        ]
      },
      "🎫 Tickets": {
        canales: ["📩│crear-ticket"],
        permisos: [
          { id: guild.roles.everyone.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
          { id: rolesMap["Support"], allow: [PermissionsBitField.Flags.ViewChannel] }
        ]
      }
    };

    for (const [categoria, data] of Object.entries(estructura)) {
      const cat = await guild.channels.create({
        name: categoria,
        type: ChannelType.GuildCategory,
        permissionOverwrites: data.permisos
      });

      for (const canal of data.canales) {
        await guild.channels.create({
          name: canal.toLowerCase().replace(/[^\w\-│]+/g, '-'),
          type: ChannelType.GuildText,
          parent: cat,
          permissionOverwrites: data.permisos
        });
      }
    }

    await interaction.editReply('✅ Servidor reseteado y estructura creada correctamente.');
  }
};
