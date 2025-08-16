const Verification = require("../../../models/verification");

module.exports = {
  data: {
    name: "verify",
    description: "Activa o desactiva la verificación.",
    options: [
      {
        name: "estado",
        type: 5, // BOOLEAN
        description: "True para activar, False para desactivar",
        required: true,
      },
      {
        name: "rol",
        type: 8, // ROLE
        description: "Selecciona el rol a dar al usuario al ser verificado.",
      },
    ],
  },

  async execute(interaction) {
    const { options, guild } = interaction;

    try {
      await interaction.deferReply();

      const status = options.getBoolean("estado");
      const role = options.getRole("rol");

      // Validación para activar sin proporcionar un rol
      if (status && !role) {
        return interaction.editReply(
          "⚠️ **Error de Configuración**\n" +
            "﹕   (❁˘︶˘❁)   ┈ Para activar el sistema de verificación, debes proporcionar un **rol** que se asignará a los usuarios después de la verificación.\n" +
            "﹕   (◍•ᴗ•◍)   ┈ Por favor, selecciona un rol y vuelve a intentarlo. ✨"
        );
      }

      const verification = await Verification.findOne({
        where: { guildId: guild.id },
      });

      // Desactivando el sistema si ya está activado
      if (!status) {
        if (!verification) {
          return interaction.editReply(
            "❌ **Sistema de Verificación Desactivado**\n" +
              "﹕   (◕︿◕✿)   ┈ El sistema de verificación ya estaba **desactivado** en este servidor.\n" +
              "﹕   (✿^‿^)   ┈ No es necesario realizar ninguna otra acción."
          );
        }
        await verification.destroy();
        return interaction.editReply(
          "❌ **Sistema de Verificación Desactivado Correctamente**\n" +
            "﹕   (✿◠‿◠)   ┈ El sistema de verificación ha sido **desactivado** exitosamente.\n" +
            "﹕   (•̀ᴗ•́)و   ┈ Ahora los nuevos miembros no necesitarán verificar su identidad para unirse."
        );
      }

      // Activando el sistema si ya está desactivado
      if (verification) {
        return interaction.editReply(
          "⚠️ **Sistema de Verificación Ya Activado**\n" +
            "﹕   (❁˘︶˘❁)   ┈ El sistema de verificación ya está **activado** en este servidor.\n" +
            "﹕   (•̀ᴗ•́)و   ┈ No es necesario realizar ninguna otra acción."
        );
      }

      await Verification.create({
        guildId: guild.id,
        roleId: role.id,
      });

      interaction.editReply(
        "✅ **Sistema de Verificación Activado Exitosamente**\n" +
          "﹕   (✿◕‿◕✿)   ┈ El sistema de verificación ha sido **activado** correctamente.\n" +
          "﹕   (｡♥‿♥｡)   ┈ Los nuevos miembros deberán verificar su identidad para obtener el rol: **" +
          role.name +
          "**.\n" +
          "﹕   🌸   ⟢   ☁️     *¡Gracias por hacer nuestro servidor más seguro!* ✨"
      );
    } catch (error) {
      interaction.editReply(
        `❌ **Error Inesperado**\n` +
          "﹕   (˘︹˘)   ┈ Ocurrió un error al intentar configurar el sistema de verificación.\n" +
          `﹕   (✿>︿<)   ┈ **Detalles:** ${error.message || error}\n` +
          "﹕   (•︵•)   ┈ Por favor, intenta de nuevo más tarde."
      );
      console.error(error);
    }
  },
};
