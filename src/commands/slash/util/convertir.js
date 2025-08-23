const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require("discord.js");


// Utiliza CoinGecko para tasas y QuickChart para gráficos
// Mapeo de símbolos a IDs de CoinGecko
const symbolToId = {
  btc: 'bitcoin',
  eth: 'ethereum',
  usdt: 'tether',
  usdc: 'usd-coin',
  bnb: 'binancecoin',
  sol: 'solana',
  ada: 'cardano',
  doge: 'dogecoin',
  shib: 'shiba-inu',
  matic: 'matic-network',
  ltc: 'litecoin',
  dot: 'polkadot',
  trx: 'tron',
  avax: 'avalanche-2',
  busd: 'binance-usd',
  xrp: 'ripple',
  eur: 'eur',
  usd: 'usd',
  ars: 'ars',
  brl: 'brl',
  gbp: 'gbp',
  jpy: 'jpy',
  cny: 'cny',
  mxn: 'mxn',
  chf: 'chf',
  rub: 'rub',
  cad: 'cad',
  aud: 'aud',
  try: 'try',
  clp: 'clp',
  pen: 'pen',
  vef: 'vef',
  vnd: 'vnd',
  krw: 'krw',
  inr: 'inr',
  pln: 'pln',
  zar: 'zar',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("convertir")
    .setDescription("Convierte entre divisas y criptomonedas, mostrando gráfico de la moneda.")
    .addStringOption(option =>
      option.setName("origen")
        .setDescription("Moneda de origen (ej: usd, eur, btc, eth)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("destino")
        .setDescription("Moneda de destino (ej: usd, eur, btc, eth)")
        .setRequired(true)
    )
    .addNumberOption(option =>
      option.setName("cantidad")
        .setDescription("Cantidad a convertir")
        .setRequired(true)
    ),

  async execute(interaction) {
    const origen = interaction.options.getString("origen");
    const destino = interaction.options.getString("destino");
    const cantidad = interaction.options.getNumber("cantidad");
    await interaction.deferReply();
    const { getConversionEmbed } = require("../../../utils/conversion.js");
    const result = await getConversionEmbed(origen, destino, cantidad);
    if (result.error) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("❌ Error de conversión")
            .setDescription(result.error)
        ]
      });
    }
    return interaction.editReply({ embeds: [result.embed], components: [result.row] });
  }
};
