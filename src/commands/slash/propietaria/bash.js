const { exec } = require("child_process");

module.exports = {
  data: {
    name: "bash",
    description: "Ejecuta un comando en la terminal.",
    category: "Propietaria",
    options: [
      {
        type: 3, // Tipo String
        name: "comando",
        description: "El comando bash que quieres ejecutar.",
        required: true,
      },
    ],
  },
  owner: true,

  async execute(interaction, client) {
    const comando = interaction.options.getString("comando");

    // Comprobar si el usuario que ejecuta el comando es un propietario
    if (!client.config.owners.includes(interaction.user.id)) {
      return interaction.reply({
        content: "No tienes permiso para usar este comando.",
        ephemeral: true, // Solo visible para el usuario que ejecutó el comando
      });
    }

    // Ejecutar el comando bash
    exec(comando, (error, stdout, stderr) => {
      if (error) {
        return interaction.reply({
          content: `Error al ejecutar el comando: \`${error.message}\``,
          ephemeral: true,
        });
      }

      if (stderr) {
        return interaction.reply({
          content: `Error: \`${stderr}\``,
          ephemeral: true,
        });
      }

      interaction.reply({
        content: `Resultado: \`\`\`bash\n${stdout}\n\`\`\``,
        ephemeral: true, // Solo visible para el usuario que ejecutó el comando
      });
    });
  },
};
