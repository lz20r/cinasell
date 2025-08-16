const Ranges = require("../models/staff");
const RoleNickname = require("../models/roleNickname");

module.exports = {
  name: "guildMemberUpdate",

  async load(old, current) {
    try {
      const roles = current.roles.cache.filter(
        ({ id }) => !old.roles.cache.has(id)
      );

      if (!roles.size) return;

      await Promise.all(
        roles.map(async (role) => {
          const roleData = await RoleNickname.findOne({
            where: { guildId: current.guild.id, roleId: role.id },
          });

          if (roleData) {
            await current.setNickname(
              `[${roleData.nickname}] ${current.user.username}`
            );
          }

          if (role.id === "1299753090441809920") {
            await Ranges.findOrCreate({
              where: { user: current.id, role: role.id },
            });
          }
        })
      );
    } catch (error) {
      console.error(`Error en guildMemberUpdate: ${error.message}`);
    }
  },
};
