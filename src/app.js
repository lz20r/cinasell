const { Client, Collection } = require("discord.js");
const { readdir } = require("fs/promises");
const { join } = require("path");

process.loadEnvFile();

// Inicializa el bot
async function initializeBot() {
  const client = new Client({
    allowedMentions: { repliedUser: false },
    intents: 3276799
  });

  client.buttons = new Collection();
  client.prefix = new Collection();
  client.modals = new Collection();
  client.menus = new Collection();
  client.slash = new Collection();

  // Sistema de invites
  client.invites = new Collection();

  client.config = require("../config.json");

  const directory = await readdir(join(__dirname, "handlers"));

  for (const file of directory) {
    // Saltar el restockMonitor ya que se inicializa manualmente
    if (file === 'restockMonitor.js') continue;
    
    try {
      const handler = require(`./handlers/${file}`);
      if (typeof handler === "function") handler(client);
    } catch (error) {
      console.error(`Error al cargar el manejador ${file}:`, error);
    }
  }
  // cargar base de datos
  //await loadDatabase(require("./handlers/database.js"));

  // Inicializar sistema de restock después del login
  client.once('ready', () => {
    console.log(`[BOT] ${client.user.tag} está listo!`);
    
    // Inicializar monitor de restock
    const RestockMonitor = require('./handlers/restockMonitor');
    client.restockMonitor = new RestockMonitor(client);
    client.restockMonitor.start();
  });

  client.on("messageReactionAdd", (reaction, user) => {
    console.log("paso")
  });



  client.login(process.env.TOKEN).catch(console.error);
}

initializeBot();


process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);


async function loadDatabase(sequelize) {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("[DATABASE] Conectado.");
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
  }
}