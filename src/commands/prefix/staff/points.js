const { getRoleByPoints } = require("../../../tools/#export");
const Staff = require("../../../models/staff");

module.exports = {
  name: "points",
  alias: ["ap"],
  permissions: ["ManageRoles"],

  async execute(_, message, args) {
    if (args.length < 2) {
      return message.reply(
        "Uso correcto: `!addpoints <usuario> <agregar|remover|mostrar|> [cantidad]`"
      );
    }

    const user = message.mentions.users.first();

    if (!user) {
      message.reply("Menciona a un usuario válido.");
    }

    const option = args[1].toLowerCase();

    if (!/agregar|remover|mostrar/.test(option)) {
      return message.reply("Opción inválida.");
    }

    try {
      const target = await Staff.findOne({ where: { user: user.id } });

      if (!target) {
        return message.reply(
          `<@${user.id}> no tiene un registro en la base de datos.`
        );
      }

      if (option === "mostrar") {
        return message.reply(
          `<@${target.user}> tiene ${target.points} puntos.`
        );
      }

      const points = parseInt(args[2]);

      if (!points || points <= 0) {
        return message.reply("Ingresa una cantidad válida.");
      }

      let text = "";
      if (option === "remover" && points) {
        text += `Se le removieron ${points} punto(s) a <@${target.user}>`;
        target.points -= points;
      } else if (option === "agregar" && points) {
        text += `Se le agregaron ${points} punto(s) a <@${target.user}>`;
        target.points += points;
      }

      const member = message.guild.members.cache.get(target.user);

      if (!member) {
        return message.reply("No encontré al miembro en este servidor.");
      }

      await target.save();

      message.reply(text);

      getRoleByPoints(member, target.points);
    } catch (error) {
      console.log(error);
    }
  },
};
