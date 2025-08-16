module.exports = {
  name: "rol",
  alias: ["role"],

  async execute(client, message, args = []) {
    const prefix = client.config?.prefix || ".";

    if (!args[0]) {
      return message.reply({
        content:
          "❓ Uso correcto / Correct usage:\n```" +
          `${prefix}rol crear | create <nombre>\n` +
          `${prefix}rol eliminar | delete <nombre>\n` +
          `${prefix}rol editar | edit <actual> <nuevo>\n` +
          `${prefix}rol dar | give <@usuario> <rol>\n` +
          `${prefix}rol quitar | remove <@usuario> <rol>\n` +
          `${prefix}rol all | todo <bots|humans|all> <rol>\n` +
          `${prefix}rol removeall | quitarall <bots|humans|all> <rol>\n` +
          "```"
      });
    }

    if (!message.member.permissions.has("ManageRoles"))
      return message.reply("❌ No tienes permisos para gestionar roles.\n❌ You don't have permission to manage roles.");

    const subcommand = args[0].toLowerCase();
    const mentioned = message.mentions.members.first();
    const roleName = args.slice(1).join(" ");

    const findRole = (name) =>
      message.guild.roles.cache.find(r => r.name.toLowerCase() === name.toLowerCase());

    const cmd = {
      create: ["crear", "create"],
      delete: ["eliminar", "delete"],
      edit: ["editar", "edit"],
      give: ["dar", "give"],
      remove: ["quitar", "remove"]
    };

    // CREAR
    if (cmd.create.includes(subcommand)) {
      if (!roleName) return message.reply("❌ Especifica el nombre del rol a crear.\n❌ Please specify the role name to create.");
      try {
        const role = await message.guild.roles.create({ name: roleName });
        return message.reply(`✅ Rol \`${role.name}\` creado correctamente.\n✅ Role \`${role.name}\` created successfully.`);
      } catch (err) {
        console.error(err);
        return message.reply("❌ Error al crear el rol.\n❌ Failed to create role.");
      }
    }

    // ELIMINAR
    if (cmd.delete.includes(subcommand)) {
      if (!roleName) return message.reply("❌ Especifica el nombre del rol a eliminar.\n❌ Please specify the role name to delete.");
      const roleToDelete = findRole(roleName);
      if (!roleToDelete) return message.reply("❌ Rol no encontrado.\n❌ Role not found.");
      try {
        await roleToDelete.delete();
        return message.reply(`🗑️ Rol \`${roleName}\` eliminado.\n🗑️ Role \`${roleName}\` deleted.`);
      } catch (err) {
        console.error(err);
        return message.reply("❌ No se pudo eliminar el rol.\n❌ Failed to delete the role.");
      }
    }

    // EDITAR
    if (cmd.edit.includes(subcommand)) {
      if (args.length < 3)
        return message.reply(`Uso: \`${prefix}rol editar <actual> <nuevo>\`\nUsage: \`${prefix}rol edit <old> <new>\``);
      const oldName = args[1];
      const newName = args.slice(2).join(" ");
      const currentRole = findRole(oldName);
      if (!currentRole) return message.reply("❌ Rol no encontrado.\n❌ Role not found.");
      try {
        await currentRole.setName(newName);
        return message.reply(`✏️ Rol renombrado a \`${newName}\`.\n✏️ Role renamed to \`${newName}\`.`);
      } catch (err) {
        console.error(err);
        return message.reply("❌ Error al renombrar el rol.\n❌ Failed to rename role.");
      }
    }

    // DAR
    if (cmd.give.includes(subcommand)) {
      if (!mentioned || args.length < 3)
        return message.reply(`Uso: \`${prefix}rol dar <@usuario> <nombre_del_rol>\`\nUsage: \`${prefix}rol give <@user> <role>\``);
      const roleToGive = findRole(args.slice(2).join(" "));
      if (!roleToGive) return message.reply("❌ Rol no encontrado.\n❌ Role not found.");
      try {
        await mentioned.roles.add(roleToGive);
        return message.reply(`✅ Rol \`${roleToGive.name}\` asignado a ${mentioned}.\n✅ Role \`${roleToGive.name}\` assigned to ${mentioned}.`);
      } catch (err) {
        console.error(err);
        return message.reply("❌ No se pudo asignar el rol.\n❌ Failed to assign role.");
      }
    }

    // QUITAR
    if (cmd.remove.includes(subcommand)) {
      if (!mentioned || args.length < 3)
        return message.reply(`Uso: \`${prefix}rol quitar <@usuario> <nombre_del_rol>\`\nUsage: \`${prefix}rol remove <@user> <role>\``);
      const roleToRemove = findRole(args.slice(2).join(" "));
      if (!roleToRemove) return message.reply("❌ Rol no encontrado.\n❌ Role not found.");
      try {
        await mentioned.roles.remove(roleToRemove);
        return message.reply(`❌ Rol \`${roleToRemove.name}\` removido de ${mentioned}.\n❌ Role \`${roleToRemove.name}\` removed from ${mentioned}.`);
      } catch (err) {
        console.error(err);
        return message.reply("❌ No se pudo quitar el rol.\n❌ Failed to remove role.");
      }
    }

    // ALL / TODO
    if (subcommand === "all" || subcommand === "todo") {
      const target = args[1]?.toLowerCase();
      const role = findRole(args.slice(2).join(" "));

      if (!["all", "bots", "humans"].includes(target))
        return message.reply("❌ Especifica si deseas aplicarlo a `bots`, `humans` o `all`.\n❌ Use `bots`, `humans` or `all`.");
      if (!role) return message.reply("❌ Rol no encontrado.\n❌ Role not found.");

      await message.reply(`⏳ Asignando el rol \`${role.name}\` a ${target}...`);

      const members = await message.guild.members.fetch();
      let success = 0, failed = 0;

      for (const member of members.values()) {
        if (
          (target === "bots" && !member.user.bot) ||
          (target === "humans" && member.user.bot)
        ) continue;

        if (!member.roles.cache.has(role.id)) {
          try {
            await member.roles.add(role);
            success++;
          } catch {
            failed++;
          }
        }
      }

      return message.channel.send(`✅ Rol \`${role.name}\` asignado a ${success} ${target}. ❌ Falló en ${failed}.`);
    }

    // REMOVEALL / QUITARALL
    if (subcommand === "removeall" || subcommand === "quitarall") {
      const target = args[1]?.toLowerCase();
      const role = findRole(args.slice(2).join(" "));

      if (!["all", "bots", "humans"].includes(target))
        return message.reply("❌ Especifica si deseas quitarlo de `bots`, `humans` o `all`.\n❌ Use `bots`, `humans` or `all`.");
      if (!role) return message.reply("❌ Rol no encontrado.\n❌ Role not found.");

      await message.reply(`⏳ Quitando el rol \`${role.name}\` de ${target}...`);

      const members = await message.guild.members.fetch();
      let success = 0, failed = 0;

      for (const member of members.values()) {
        if (
          (target === "bots" && !member.user.bot) ||
          (target === "humans" && member.user.bot)
        ) continue;

        if (member.roles.cache.has(role.id)) {
          try {
            await member.roles.remove(role);
            success++;
          } catch {
            failed++;
          }
        }
      }

      return message.channel.send(`✅ Rol \`${role.name}\` quitado de ${success} ${target}. ❌ Falló en ${failed}.`);
    }

    return message.reply(`❌ Subcomando inválido.\n❌ Invalid subcommand. Usa \`${prefix}rol crear\` o \`${prefix}rol create\`.`);
  },
};
