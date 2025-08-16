const { readdir } = require("fs/promises");
const { resolve } = require("path");

module.exports = async (client) => {
  const directory = await readdir(resolve("src", "events"));

  for (const file of directory) {
    if (!file.endsWith(".js")) continue;

    try {
      const event = require(`../events/${file}`);
      const method = event.once ? "once" : "on";

      client[method](event.name, (...args) => {
        event.load(...args, client);
      });
    } catch (error) {
      console.error(`Error al cargar el evento ${file}:`, error);
    }
  }

  console.log(`[EVENTS] ${directory.length} eventos.`);
};
