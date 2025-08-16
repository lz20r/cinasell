const { readdir } = require("fs/promises");

const PATH = "./src/commands/prefix";

module.exports = async function (client) {

  client.on("messageReactionAdd", (require("../events/messageReactionAdd.js")).load.bind(null, client));
};
