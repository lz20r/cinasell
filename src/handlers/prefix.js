const { readdir } = require("fs/promises");

const PATH = "./src/commands/prefix";

module.exports = async function (client) {
  const directory = await readdir(PATH);

  for (const folder of directory) {
    const files = await readdir(PATH + `/${folder}`);

    for (const file of files) {
      if (!file.endsWith(".js")) continue;

      const command = require(`../commands/prefix/${folder}/${file}`);
      client.prefix.set(command.name, command);
      if(command.alias) {
        command.alias.forEach(alias => {
          client.prefix.set(alias, command);
        });
      }
    }
  }
};
