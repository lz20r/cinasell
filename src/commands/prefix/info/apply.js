module.exports = {
  name: "apply",
  alias: ["aplicar"],

  async execute(client, message, args) {
    const prefix = client.config?.prefix || ".";
    const language = args[0]?.toLowerCase();

    if (!language || (language !== "es" && language !== "eng")) {
      return message.reply(` Uso correcto: \`${prefix}apply <es|eng>\`\n Correct usage: \`${prefix}apply <es|eng>\``);
    }

    const formLinks = {
      es: client.config.forms?.staff_es || "https://forms.gle/spanish-form",
      eng: client.config.forms?.staff_eng || "https://forms.gle/english-form"
    };

    const embeds = {
      es: {
        title: " Formulario de Postulación - Staff",
        description: "¿Quieres formar parte de nuestro equipo? ¡Completa el formulario de postulación!",
        color: 0x00ff00,
        fields: [
          {
            name: " Instrucciones",
            value: " Rellena el formulario con información veraz\n Todas las preguntas son obligatorias\n Las respuestas serán revisadas por el equipo",
            inline: false
          },
          {
            name: " Tiempo estimado",
            value: "5-10 minutos",
            inline: true
          },
          {
            name: " Respuesta",
            value: "En 24-48 horas",
            inline: true
          }
        ],
        footer: {
          text: "Formulario de Staff  Cinasell",
          icon_url: message.guild.iconURL()
        }
      },
      eng: {
        title: " Staff Application Form",
        description: "Want to join our team? Complete the application form!",
        color: 0x00ff00,
        fields: [
          {
            name: " Instructions",
            value: " Fill the form with truthful information\n All questions are mandatory\n Answers will be reviewed by the team",
            inline: false
          },
          {
            name: " Estimated time",
            value: "5-10 minutes",
            inline: true
          },
          {
            name: " Response",
            value: "Within 24-48 hours",
            inline: true
          }
        ],
        footer: {
          text: "Staff Form  Cinasell",
          icon_url: message.guild.iconURL()
        }
      }
    };

    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(language === "es" ? " Abrir Formulario" : " Open Form")
        .setStyle(ButtonStyle.Link)
        .setURL(formLinks[language])
    );

    try {
      await message.reply({
        embeds: [embeds[language]],
        components: [button]
      });
    } catch (error) {
      console.error("Error enviando formulario:", error);
      message.reply(" Error al enviar el formulario.\n Error sending form.");
    }
  }
};
