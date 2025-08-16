const Model = require("../models/logs");

const cache = new Map();

// Limpiar cache cada 30 minutos para evitar datos obsoletos
setInterval(() => {
  cache.clear();
}, 30 * 60 * 1000);

module.exports = async function (guildId) {
  if (!guildId) return false;
  
  if (cache.has(guildId)) return cache.get(guildId);

  try {
    const logs = await Model.findOne({ where: { guildId } });
    const enabled = logs ? logs.dataValues : false;

    // Solo cachear si está habilitado
    if (enabled) {
      cache.set(guildId, enabled);
    }

    return enabled;
  } catch (error) {
    console.error("Error en isLogEnabled:", error);
    return false;
  }
};

// Función para limpiar cache de un servidor específico
module.exports.clearCache = function(guildId) {
  if (guildId) {
    cache.delete(guildId);
  } else {
    cache.clear();
  }
};
