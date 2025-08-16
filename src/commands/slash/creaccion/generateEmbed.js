const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: "embed",
    description: "Crea un embed totalmente personalizable.",
    contexts: [0],
    default_member_permissions: "8",
    options: [
      {
        type: 3,
        name: "descripción",
        description: "Descripción del embed",
        required: true,
      },
      { type: 3, name: "título", description: "Título del embed." },
      { type: 3, name: "url", description: "URL del título del embed" },
      { type: 11, name: "miniatura", description: "Miniatura del embed" },
      { type: 11, name: "imagen", description: "Imagen del embed" },
      {
        type: 3,
        name: "color",
        description: "Color hexadecimal del embed (#RRGGBB)",
      },
      { type: 3, name: "footer", description: "Texto del pie de página" },
      {
        type: 11,
        name: "icono_footer",
        description: "Ícono del pie de página",
      },
      { type: 3, name: "autor", description: "Nombre del autor" },
      { type: 11, name: "icono_autor", description: "Ícono del autor" },
      {
        type: 5,
        name: "timestamp",
        description: "Añadir timestamp (true/false)",
      },
    ],
  },

  async execute(interaction, client) {
    const title = interaction.options.getString("título");
    const description = interaction.options.getString("descripción");
    const url = interaction.options.getString("url");
    const thumbnail = interaction.options.getAttachment("miniatura");
    const image = interaction.options.getAttachment("imagen");
    const color = interaction.options.getString("color");
    const footer = interaction.options.getString("footer");
    const footerIcon = interaction.options.getAttachment("icono_footer");
    const author = interaction.options.getString("autor");
    const authorIcon = interaction.options.getAttachment("icono_autor");
    const timestamp = interaction.options.getBoolean("timestamp");

    const embed = new EmbedBuilder().setDescription(
      description.replace(/\\n/g, "\n")
    );

    if (title) embed.setTitle(title);
    if (url) embed.setURL(url);
    if (color) embed.setColor(color);
    if (thumbnail) embed.setThumbnail(thumbnail.url);
    if (image) embed.setImage(image.url);
    if (author) embed.setAuthor({ name: author, iconURL: authorIcon?.url });
    if (footer) embed.setFooter({ text: footer, iconURL: footerIcon?.url });
    if (timestamp) embed.setTimestamp();

    await interaction.reply({ content: "Embed enviado", ephemeral: true });
    interaction.channel.send({ embeds: [embed] });
  },
};
