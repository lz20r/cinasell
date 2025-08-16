const RoleNickname = require("../../../models/roleNickname");

module.exports = {
  data: {
    name: "setrole",
    description: "Asigna un apodo a un rol en el servidor.",
    options: [
      {
        type: 8,
        name: "rol",
        description: "El rol al que quieres asignar un apodo",
        required: true,
      },
      {
        type: 3,
        name: "apodo",
        description: "El apodo que se asignará a los usuarios con este rol",
        required: true,
      },
    ],
  },
  owner: true,

  async execute(interaction) {
    const role = interaction.options.getRole("rol");
    const nickname = interaction.options.getString("apodo");

    await RoleNickname.upsert({
      guildId: interaction.guild.id,
      roleId: role.id,
      nickname,
    });

    interaction.reply(
      `Al rol **${role.name}** ahora asignará el apodo **${nickname}**.`
    );
  },
};
