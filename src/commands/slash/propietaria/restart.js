module.exports = {
  data: {
    name: "restart",
    description: "Reinicia el bot.",
    category: "Propietaria",
  },
  owner: true,

  async execute(interaction, client) {
    // Comprobar si el usuario que ejecuta el comando es un propietario
    if (!client.config.owners.includes(interaction.user.id)) {
      return interaction.reply({
        content: "No tienes permiso para usar este comando.",
        ephemeral: true, // Solo visible para el usuario que ejecutó el comando
      });
    }

    try {
      await interaction.reply({
        content: "El bot se está reiniciando...",
        ephemeral: true, // Solo visible para el usuario que ejecutó el comando
      });

      // Salida del proceso actual para que el sistema reinicie el bot
      process.exit(0);
    } catch (error) {
      console.error("Error al intentar reiniciar el bot:", error);
      return interaction.reply({
        content: "Hubo un error al intentar reiniciar el bot.",
        ephemeral: true,
      });
    }
  },
};
