module.exports = {
  data: {
    name: "sale-price",
    description: "Calcula el precio de venta.",
    default_member_permissions: "8",
    options: [
      {
        type: 10,
        name: "costo",
        description: "Costo total de todos los productos.",
        required: true,
      },
      {
        type: 10,
        name: "ganancia",
        description: "Porcentaje de ganancia deseado.",
        required: true,
      },
      {
        type: 4,
        name: "cantidad",
        description: "Cantidad de productos.",
      },
    ],
  },
  owner: true,

  async execute(interaction) {
    const totalCost = interaction.options.getNumber("costo");
    const revenue = interaction.options.getNumber("ganancia");
    const quantity = interaction.options.getInteger("cantidad") || 1;

    if (totalCost < 0 || revenue < 0) {
      interaction.reply("El costo y gananciadeben ser mayores a cero.");
      return;
    }

    const costPerProduct = totalCost / quantity;
    const pricePerProduct = costPerProduct * (1 + revenue / 100);
    const totalRevenue = pricePerProduct * quantity;
    const totalProfit = totalRevenue - totalCost;

    const embed = {
      fields: [
        {
          name: "Cantidad de productos:",
          value: `${quantity}`,
        },
        {
          name: "Costo por producto:",
          value: `$${costPerProduct.toFixed(2)}`,
        },
        {
          name: "Precio de venta por producto:",
          value: `$${pricePerProduct.toFixed(2)}`,
        },
        {
          name: "Ganancia total esperada:",
          value: `$${totalProfit.toFixed(2)}`,
        },
      ],
      color: 0x37b160,
    };

    interaction.reply({ embeds: [embed] });
  },
};
