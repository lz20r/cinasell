const { REST, Routes } = require("discord.js");
const { readdir } = require("fs/promises");
const { resolve } = require("path");

module.exports = async (client) => {
  const directory = await readdir(resolve("src", "commands", "slash"));

  const commandsBody = [];

  for (const folder of directory) {
    const files = await readdir(resolve("src", "commands", "slash", folder));

    for (const file of files) {
      delete require.cache[
        require.resolve(`../commands/slash/${folder}/${file}`)
      ];

      const command = require(`../commands/slash/${folder}/${file}`);
      
      // Validar que el comando tiene la estructura correcta
      if (!command || !command.data || !command.data.name) {
        console.error(`[SLASH] Comando inválido en ${folder}/${file}: falta data.name`);
        continue;
      }

      client.slash.set(command.data.name, command);
      commandsBody.push(command.data);
    }
  }

  const routes = Routes.applicationCommands(client.config.id);

  await new REST().setToken(process.env.TOKEN).put(routes, {
    body: commandsBody,
  });

  console.log(`[INTERACTIONS] ${directory.length} categories loaded`);
  console.log(`[INTERACTIONS] ${commandsBody.length} commands loaded`);
};
