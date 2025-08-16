const { EmbedBuilder, ComponentType } = require("discord.js");

module.exports = {
  id: "reviews",

  async execute(interaction, _, client) {
    const { user, values } = interaction;
    const rating = values[0]; // "1" to "5"
    const stars = "⭐".repeat(Number(rating));

    await interaction.reply({
      content: `¿Te gustaría agregar algún comentario adicional? Escribe tu respuesta o "no" para omitir.`,
      ephemeral: true,
    });

    try {
      const dmChannel = await user.createDM(); //pq createDM()?
      const questionMsg = await dmChannel.send("✍️ Puedes escribir tu comentario adicional ahora. Escribe `no` para omitir.");

      const collected = await dmChannel.awaitMessages({
        filter: m => m.author.id === user.id,
        max: 1,
        time: 60000,
        errors: ["time"]
      });

      const answer = collected.first()?.content;

      await dmChannel.send("✅ ¡Gracias por tu reseña!");

      const embed = new EmbedBuilder()
        .setColor(0xfff200)
        .setTitle("📝 Nueva Reseña")
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
        .addFields({ name: "Calificación", value: stars, inline: true })
        .setTimestamp();

      if (answer && answer.toLowerCase() !== "no") {
        embed.addFields({ name: "Comentario adicional", value: answer });
      }

      const reviewChannel = await client.channels.fetch("1401988507479834654");
      if (reviewChannel) {
        await reviewChannel.send({ embeds: [embed] });
      } else {
        console.log("Channel not found.");
      }
    } catch (err) {
      console.log(err);
      await interaction.followUp({
        content: "⏱️ No recibimos ningún comentario. Gracias igualmente por tu reseña.",
        ephemeral: true
      });
    }
  }
};
