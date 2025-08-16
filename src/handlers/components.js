// Importa los módulos necesarios
const { readdir } = require("fs/promises");
const { resolve } = require("path");

module.exports = async (client) => {
  try {
    const directory = await readdir(resolve("src", "components"));

    for (const folder of directory) {
      const files = await readdir(resolve("src", "components", folder));

      for (const file of files) {
        const component = require(`../components/${folder}/${file}`);
        client[folder].set(component.id, component);
      }
    }

    console.log(`[COMPONENTS] ${directory.length} componentes.`);
  } catch (error) {
    console.error("Error al cargar los componentes:", error);
  }
};
