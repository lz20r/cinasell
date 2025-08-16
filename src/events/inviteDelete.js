const Invite = require("../models/invites");

module.exports = {
  name: "inviteDelete",

  async load(inviteDeleted, client) {
    try {
      if (!client.invites) {
        console.warn("La colección de invitaciones no está inicializada.");
        return;
      }

      const guildId = inviteDeleted.guild?.id;
      const inviteCode = inviteDeleted.code;

      if (!guildId || !inviteCode) {
        console.warn("Faltan datos de la invitación eliminada (guildId o inviteCode).");
        return;
      }

      // Eliminar del cache
      const cachedInvites = client.invites.get(guildId);
      if (cachedInvites) {
        cachedInvites.delete(inviteCode);
        client.invites.set(guildId, cachedInvites);
      } else {
        console.warn(`No se encontró la cache de invitaciones para el servidor: ${guildId}`);
      }

      // Eliminar de la base de datos
      const deletedRows = await Invite.destroy({
        where: {
          guildId: guildId,
          inviteCode: inviteCode,
        },
      });

      if (deletedRows === 0) {
        console.warn(`No se encontró en la base de datos la invitación con código: ${inviteCode}`);
      }
    } catch (error) {
      console.error("Error al procesar la eliminación de la invitación:", error);
    }
  },
};
