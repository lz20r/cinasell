module.exports = {
  id: "newname",

  async execute(interaction, _, client) {
    const input = interaction.fields.getTextInputValue("name");

    const channel = client.channels.cache.get(interaction.channelId);

    await channel.setName(input);

    interaction.reply({
      content: `Nombre del canal cambiado a \`${input}\``,
      ephemeral: true,
    });
  },
};
