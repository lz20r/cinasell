const { inspect } = require("util");

module.exports = {
  data: {
    name: "eval",
    description: "Ejecuta código JavaScript proporcionado.",
    category: "Propietaria",
    options: [
      {
        type: 3, // Tipo String
        name: "código",
        description: "El código que quieres ejecutar.",
        required: true,
      },
    ],
  },
  owner: true,

  async execute(interaction, client) {
    const código = interaction.options.getString("código");

    // Comprobar si el usuario que ejecuta el comando es un propietario
    if (!client.config.owners.includes(interaction.user.id)) {
      return interaction.reply({
        content: "No tienes permiso para usar este comando.",
        ephemeral: true, // Solo visible para el usuario que ejecutó el comando
      });
    }

    try {
      let resultado = eval(código);
      if (typeof resultado !== "string") {
        resultado = inspect(resultado);
      }

      return interaction.reply({
        content: `\`\`\`js\n${resultado}\n\`\`\``,
        ephemeral: true, // Respuesta visible solo para el usuario que ejecutó el comando
      });
    } catch (error) {
      return interaction.reply({
        content: `Error al ejecutar el código: \`\`\`js\n${error}\n\`\`\``,
        ephemeral: true, // Solo visible para el usuario que ejecutó el comando
      });
    }
  },
};
