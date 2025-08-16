const accounts = {
  crunchyroll: { image: "https://i.ibb.co/zs0c99S/image.jpg", color: 0xff8c00 },
  microsoft: { image: "https://i.ibb.co/2MwbDnp/image.jpg", color: 0x00a857 },
  netflix: { image: "https://i.ibb.co/hsT2Fdz/image.jpg", color: 0xe50914 },
  spotify: { image: "https://i.ibb.co/KNZ2Mxs/image.jpg", color: 0x1db954 },
  steam: { image: "https://i.ibb.co/CtDj3j4/steam.png", color: 0x1b2838 },
  danz: { image: "https://i.ibb.co/x73NBz4/image.jpg", color: 0xffffff },
  max: { image: "https://i.ibb.co/1ZW3K63/image.jpg", color: 0x00a3e0 },
};

module.exports = (client, type, size, aim) => {
  if (!client || !type || !aim) return;

  const guild = client.guilds.cache.get("1295430359227432970");

  const embed = {
    title: `${type.toUpperCase()}`,
    description: `${size || 0} fueron agregadas.`,
    image: { url: accounts[type].image },
    footer: { text: guild.name, icon_url: guild.iconURL() },
    timestamp: new Date().toISOString(),
    color: accounts[type].color,
  };

  const channel = guild.channels.cache.get("1295430360267620539");

  let content;
  if (aim === "drop") content = "Nuevo stock en el **Drop**.";
  else content = "Nuevo stock de **Reemplazo*.";

  channel.send({ content, embeds: [embed] });
};
