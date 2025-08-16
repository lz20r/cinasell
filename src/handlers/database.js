const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.CINASHOP_NAME,
  process.env.CINASHOP_USER,
  process.env.CINASHOP_PASSWORD,
  {
    host: process.env.CINASHOP_HOST,
    port: process.env.CINASHOP_PORT,
    dialect: "mysql",
    logging: false,
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    console.log("[DATABASE] Conectado.");
  } catch (error) {
    console.log(error.message || error);
  }
})();

module.exports = sequelize;
