module.exports = {
  name: "rename",
  alias: ["renombrar", "rn"],
  permissions: ["ManageChannels"],

  async execute(_, message, args) {
    if (args.length < 2) {
      return message.reply(
        "Ingresa la opción y el nuevo nombre. Ejemplo: `-rename canal nombre` o `-rename categoria nombre`."
      );
    }

    const option = args[0].toLowerCase();
    const name = args.slice(1).join(" ");

    if (name.length > 100) {
      return message.reply("El nombre no puede tener más de 100 caracteres.");
    }

    if (option === "canal") {
      await message.channel.setName(name);
      message.reply(`El nombre del canal se ha cambiado a \`${name}\`.`);
    } else if (option === "categoria") {
      const parent = message.channel.parent;

      if (!parent) {
        return message.reply("Este canal no está en una categoría.");
      }

      await parent.setName(name);

      message.reply(`El nombre de la categoría se ha cambiado a \`${name}\`.`);
    } else {
      message.reply("Elige una opción válida: `canal` o `categoria`.");
    }
  },
};
