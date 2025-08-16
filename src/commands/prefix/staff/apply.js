const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: "apply",
  alias: ["apply-forms", "forms"],
  permissions: ["ManageChannels"],

  async execute(client, message, args) {
    const prefix = client.config?.prefix || ".";

    if (!message.member.permissions.has("ManageChannels")) {
      return message.reply(" No tienes permisos para gestionar canales.\n You don't have permission to manage channels.");
    }

    // Detectar idioma basado en el argumento - ".apply en" o ".apply es"
    const langArg = args[0]?.toLowerCase();
    const isSpanish = langArg === 'es' || !langArg; // Solo español si es 'es' o sin argumento
    const lang = langArg === 'en' ? 'EN' : 'ES';

    // Debug: mostrar qué idioma detectó
    console.log(`Apply command: args[0]="${args[0]}", langArg="${langArg}", isSpanish=${isSpanish}, lang="${lang}"`);

    // Obtener formularios desde config según idioma
    const staffForm = client.config.supportServer?.StaffForm?.[lang];
    const helperForm = client.config.supportServer?.HelperForm?.[lang];
    const partnerForm = client.config.supportServer?.PartnerForm?.[lang];

    if (!staffForm && !helperForm && !partnerForm) {
      return message.reply(isSpanish ? 
        " No hay formularios configurados." : 
        " No forms configured.");
    }

    const embed = {
      title: isSpanish ? " Formularios de Aplicación" : " Application Forms",
      color: 0x1e90ff,
      description: isSpanish ? 
        "Haz clic en los botones para acceder a los formularios:" : 
        "Click the buttons below to access the forms:",
      timestamp: new Date(),
      footer: {
        text: isSpanish ? "Sistema de Formularios" : "Forms System",
        icon_url: client.user.displayAvatarURL()
      }
    };

    // Crear botones para los formularios disponibles
    const components = [];
    const buttons = [];

    if (staffForm && staffForm.trim() !== '') {
      buttons.push(
        new ButtonBuilder()
          .setLabel(isSpanish ? " Aplicar Staff" : " Apply Staff")
          .setStyle(ButtonStyle.Link)
          .setURL(staffForm)
      );
    }

    if (helperForm && helperForm.trim() !== '') {
      buttons.push(
        new ButtonBuilder()
          .setLabel(isSpanish ? " Aplicar Helper" : " Apply Helper")
          .setStyle(ButtonStyle.Link)
          .setURL(helperForm)
      );
    }

    if (partnerForm && partnerForm.trim() !== '') {
      buttons.push(
        new ButtonBuilder()
          .setLabel(isSpanish ? " Aplicar Partner" : " Apply Partner")
          .setStyle(ButtonStyle.Link)
          .setURL(partnerForm)
      );
    }

    // Dividir botones en filas (máximo 5 por fila)
    for (let i = 0; i < buttons.length; i += 5) {
      const row = new ActionRowBuilder()
        .addComponents(buttons.slice(i, i + 5));
      components.push(row);
    }

    if (buttons.length === 0) {
      embed.description = isSpanish ? 
        " No hay formularios configurados actualmente." : 
        " No forms currently configured.";
    }

    try {
      const reply = await message.reply({ 
        embeds: [embed],
        components: components
      });
      
      // Eliminar mensaje después de 10 minutos
      setTimeout(() => {
        reply.delete().catch(() => {});
      }, 600000);
      
    } catch (error) {
      console.error("Error enviando formularios:", error);
      message.reply(isSpanish ? 
        " Error al enviar formularios." : 
        " Error sending forms.");
    }
  }
};
