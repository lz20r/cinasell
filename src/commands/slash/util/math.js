
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const math = require("mathjs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("math")
    .setDescription("Resuelve una expresión matemática.")
    .addStringOption(option =>
      option.setName("expresion")
        .setDescription("Expresión matemática a resolver. Ej: 2+2*3")
        .setRequired(true)
    ),

  async execute(interaction) {
    const expr = interaction.options.getString("expresion");
    let result;
    try {
      result = math.evaluate(expr);
    } catch (e) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("❌ Error en la expresión")
            .setDescription("No se pudo calcular la expresión. Asegúrate de que la sintaxis es válida y puedes usar funciones avanzadas de mathjs.")
        ],
        ephemeral: true
      });
    }
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle("🧮 Resultado matemático")
          .addFields(
            { name: "Expresión", value: `\`${expr}\`` },
            { name: "Resultado", value: `\`${result}\`` }
          )
      ]
    });
  }
};
