// Función utilitaria para obtener datos de conversión, gráfico y cambio 24h
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Mapeo de símbolos a IDs de CoinGecko (por compatibilidad futura)
const symbolToId = {
  btc: 'bitcoin', eth: 'ethereum', usdt: 'tether', usdc: 'usd-coin', bnb: 'binancecoin', sol: 'solana', ada: 'cardano', doge: 'dogecoin', shib: 'shiba-inu', matic: 'matic-network', ltc: 'litecoin', dot: 'polkadot', trx: 'tron', avax: 'avalanche-2', busd: 'binance-usd', xrp: 'ripple', eur: 'eur', usd: 'usd', ars: 'ars', brl: 'brl', gbp: 'gbp', jpy: 'jpy', cny: 'cny', mxn: 'mxn', chf: 'chf', rub: 'rub', cad: 'cad', aud: 'aud', try: 'try', clp: 'clp', pen: 'pen', vef: 'vef', vnd: 'vnd', krw: 'krw', inr: 'inr', pln: 'pln', zar: 'zar',
};

async function getConversionEmbed(origen, destino, cantidad) {
  const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
  const apiKey = process.env.CRYPTOCOMPARE_KEY || "";
  let rate = 1;
  let error = null;
  origen = origen.toLowerCase();
  destino = destino.toLowerCase();
  try {
    const url = `https://min-api.cryptocompare.com/data/price?fsym=${origen.toUpperCase()}&tsyms=${destino.toUpperCase()}`;
    const res = await fetch(url, { headers: apiKey ? { Authorization: `Apikey ${apiKey}` } : {} });
    const data = await res.json();
    if (data[destino.toUpperCase()]) {
      rate = data[destino.toUpperCase()];
    } else {
      const url2 = `https://min-api.cryptocompare.com/data/price?fsym=${destino.toUpperCase()}&tsyms=${origen.toUpperCase()}`;
      const res2 = await fetch(url2, { headers: apiKey ? { Authorization: `Apikey ${apiKey}` } : {} });
      const data2 = await res2.json();
      if (data2[origen.toUpperCase()]) {
        rate = 1 / data2[origen.toUpperCase()];
      } else {
        error = "No se pudo obtener la tasa de cambio. Verifica los símbolos de las monedas.";
      }
    }
  } catch (e) {
    error = "Error al consultar la API de tasas de cambio.";
  }
  if (error) {
    return { error };
  }
  const resultado = cantidad * rate;
  // Historial y cambio 24h
  let chartUrl = null;
  let change24h = null;
  try {
    const histUrl = `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${origen.toUpperCase()}&tsym=${destino.toUpperCase()}&limit=7`;
    const res = await fetch(histUrl, { headers: apiKey ? { Authorization: `Apikey ${apiKey}` } : {} });
    const hist = await res.json();
    if (hist.Data && hist.Data.Data) {
      const prices = hist.Data.Data.map(p => p.close);
      const labels = hist.Data.Data.map(p => {
        const d = new Date(p.time * 1000);
        return `${d.getDate()}/${d.getMonth()+1}`;
      });
      chartUrl = `https://quickchart.io/chart?c={type:'line',data:{labels:${JSON.stringify(labels)},datasets:[{label:'${origen.toUpperCase()}→${destino.toUpperCase()}',data:${JSON.stringify(prices)}}]}}`;
      if (prices.length >= 2) {
        const prev = prices[prices.length-2];
        const last = prices[prices.length-1];
        change24h = ((last - prev) / prev) * 100;
      }
    }
  } catch (e) {
    chartUrl = null;
    change24h = null;
  }
  const embed = new EmbedBuilder()
    .setColor(0x00bfff)
    .setTitle(`Conversión de ${origen.toUpperCase()} a ${destino.toUpperCase()}`)
    .addFields(
      { name: "Cantidad", value: `${cantidad} ${origen.toUpperCase()}` },
      { name: "Resultado", value: `${resultado} ${destino.toUpperCase()}` },
      { name: "Tasa actual", value: `1 ${origen.toUpperCase()} = ${rate} ${destino.toUpperCase()}` },
      change24h !== null ? { name: "Cambio 24h", value: `${change24h > 0 ? '📈' : '📉'} ${change24h.toFixed(2)}%` } : null
    ).setTimestamp();
  if (chartUrl) embed.setImage(chartUrl);
  else embed.setFooter({ text: "No se pudo generar el gráfico." });
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`recargar_conv_${origen}_${destino}_${cantidad}`)
      .setLabel('🔄 Recargar')
      .setStyle(ButtonStyle.Primary)
  );
  return { embed, row };
}

module.exports = { getConversionEmbed };
