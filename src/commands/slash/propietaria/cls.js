module.exports = {
  data: {
    name: "cls",
    description: "Borra una cantidad de mensajes del canal.",
    category: "Propietaria",
    options: [
      {
        type: 4, // Tipo Integer
        name: "cantidad",
        description:
          "La cantidad de mensajes que quieres borrar (entre 1 y 100).",
        required: true
      }
    ]
  },
  owner: true,

  async execute(interaction, client) {
    const cantidad = interaction.options.getInteger("cantidad");

    // Validar que la cantidad esté entre 1 y 100
    if (cantidad < 1 || cantidad > 100) {
      return interaction.reply({
        content: "Debes proporcionar un número entre 1 y 100.",
        ephemeral: true // Solo visible para el usuario que ejecutó el comando
      });
    }

    // Intentar borrar los mensajes
    try {
      const messages = await interaction.channel.bulkDelete(cantidad, true);
      return interaction.reply({
        content: `Se han borrado ${messages.size} mensajes.`,
        ephemeral: true // Respuesta visible solo para el usuario que ejecutó el comando
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "Hubo un error al intentar borrar los mensajes.",
        ephemeral: true
      });
    }
  }
};
