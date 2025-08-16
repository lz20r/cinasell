module.exports = {
  name: "create",
  alias: ["cch"],

  async execute(_, message, args) {
    if (args.length < 2) {
      return message.reply(
        "Uso incorrecto del comando. Ejemplo: `!create <tipo> <nombre>`.\nTipos disponibles: `texto`, `voz`, `categoría`."
      );
    }

    const type = args[0].toLowerCase();
    const name = args.slice(1).join(" ");

    let channelType;
    if (type === "texto") {
      channelType = 0;
    } else if (type === "voz") {
      channelType = 2;
    } else if (type === "categoría") {
      channelType = 4;
    } else {
      return reply("Tipo inválido. Usa `texto`, `voz` o `categoría`.");
    }

    try {
      const channel = await message.guild.channels.create({
        name,
        type: channelType,
      });

      message.channel.send(`<#${channel.id}> se creó exitosamente.`);
    } catch (error) {
      console.error(error);
      message.channel.send("Hubo un error al crear el canal.");
    }
  },
};
