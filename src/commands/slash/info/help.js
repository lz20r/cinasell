const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: {
    name: "help",
    description: "Muestra la lista de comandos organizados por categoría.",
    category: "General"
  },

  async execute(interaction, client) {
    // Asegurarse de que la interacción se "difiera" antes de hacer cualquier operación.
    await interaction.deferReply({ ephemeral: false });

    const loadCommandsByCategory = () => {
      const commandsPath = path.join(__dirname, "..");

      const categories = {};

      const folders = fs
        .readdirSync(commandsPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory());

      for (const folder of folders) {
        const category = folder.name;
        const categoryPath = path.join(commandsPath, category);

        const commandFiles = fs
          .readdirSync(categoryPath)
          .filter((file) => file.endsWith(".js"));

        categories[category] = {
          description: `Comandos en la categoría **${category}**`,
          commands: commandFiles
            .map((file) => {
              try {
                const command = require(path.join(categoryPath, file));
                return command?.data?.name ?? null;
              } catch (e) {
                console.warn(`Error al cargar comando ${file}:`, e);
                return null;
              }
            })
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b)) 
        };
      }

      return categories;
    };

    const categories = loadCommandsByCategory();

    const totalCategories = Object.keys(categories).length;
    const totalCommands = Object.values(categories).reduce(
      (acc, cat) => acc + cat.commands.length,
      0
    );

    // Crear el menú de selección de categorías
    const categoryMenu = new StringSelectMenuBuilder()
      .setCustomId("help-menu")
      .setPlaceholder(`Selecciona una categoría, ${interaction.user.username}`)
      .addOptions([
        {
          label: "Menú Principal",
          value: "main-menu",
          description: "Volver al menú principal"
        },
        ...Object.keys(categories).map((category) => ({
          label: category.charAt(0).toUpperCase() + category.slice(1),
          value: category,
          description: `Ver comandos en la categoría ${category}`
        }))
      ]);

    // Botón para borrar el menú
    const deleteButton = new ButtonBuilder()
      .setCustomId("delete-menu")
      .setLabel("❌")
      .setStyle(ButtonStyle.Danger);

    // Crear filas separadas para el menú y el botón
    const rowMenu = new ActionRowBuilder().addComponents(categoryMenu);
    const rowButton = new ActionRowBuilder().addComponents(deleteButton);

    // Función para mostrar el menú principal
    const showMainMenu = async () => {
      const categoryText = Object.keys(categories)
        .map((category) => {
          if (typeof category === "string") {
            return `\`${
              category.charAt(0).toUpperCase() + category.slice(1)
            }\``;
          }
          return "";
        })
        .join("   "); // Para alinear las categorías de forma compacta

      const embed = new EmbedBuilder()
        .setTitle("Comandos de Cinashop")
        .setDescription(
          `Tengo **${totalCategories}** categorías y **${totalCommands}** comandos para explorar.`
        )
        .addFields({
          name: "» Categorías",
          value: categoryText || "No hay categorías disponibles.",
          inline: false
        })
        .addFields({
          name: "» Enlaces útiles",
          value: `[Website](https://cinasell.es) | [Wiki](https://cinasell.es/wiki) | [Privacidad](https://cinasell.es/privacy) | [Soporte](https://cinasell.es/support)`,
          inline: false
        })
        .setColor(0x2f3136)
        .setFooter({
          text: "© CinaShop",
          iconURL: client.user.displayAvatarURL()
        });

      await interaction.editReply({
        embeds: [embed],
        components: [rowMenu, rowButton] // Se utilizan ambas filas aquí
      });
    };

    // Mostrar el menú principal
    await showMainMenu();

    const filter = (i) =>
      i.customId === "help-menu" ||
      (i.customId === "delete-menu" && i.user.id === interaction.user.id);

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000
    });

    collector.on("collect", async (i) => {
      if (i.customId === "delete-menu") {
        // Eliminar el mensaje completamente cuando se haga clic en "❌"
        await i.message.delete(); // Elimina el mensaje por completo
        return;
      }

      if (i.values[0] === "main-menu") {
        await showMainMenu();
        return;
      }

      // Mostrar comandos de la categoría seleccionada
      const selectedCategory = categories[i.values[0]];
      const categoryEmbed = new EmbedBuilder()
        .setTitle(
          `📂 Categoría: ${
            i.values[0].charAt(0).toUpperCase() + i.values[0].slice(1)
          }`
        )
        .setDescription(selectedCategory.description)
        .setColor(0x3498db)
        .addFields({
          name: "Comandos disponibles",
          value:
            selectedCategory.commands.map((cmd) => `\`${cmd}\``).join("\n") ||
            "No hay comandos en esta categoría."
        })
        .setFooter({
          text: `© CinaShop`,
          iconURL: client.user.displayAvatarURL()
        });

      await i.update({
        embeds: [categoryEmbed],
        components: [rowMenu, rowButton]
      });
    });

    collector.on("end", async () => {
      // No hacer nada al finalizar el collector, ya que se manejará con el botón de borrar
    });
  }
};
