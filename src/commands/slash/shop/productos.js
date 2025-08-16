const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const SellAuthAPI = require("../../../utils/sellauth");

module.exports = {
  data: {
    name: "productos",
    description: "Muestra una lista de todos los productos disponibles en la tienda.",
    category: "Shop",
    options: []
  },

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const sellauth = new SellAuthAPI();
      
      // Verificar conexión con la API
      const connectionTest = await sellauth.testConnection();
      if (!connectionTest) {
        return interaction.editReply({
          embeds: [{
            title: " Error de Conexión",
            description: "No se pudo conectar con la API de la tienda.",
            color: 0xff0000,
            timestamp: new Date()
          }]
        });
      }

      // Obtener TODOS los productos de TODAS las páginas con deduplicación
      //console.log("[PRODUCTOS]  Iniciando obtención completa de productos...");
      const uniqueProductsMap = new Map(); // Usar Map para deduplicación automática por ID
      let currentPage = 1;
      let totalPages = 1;
      let totalApiProducts = 0;

      do {
        //console.log(`[PRODUCTOS]  Obteniendo página ${currentPage}...`);
        const response = await sellauth.getProducts(currentPage);
        
        if (!response || !response.data) {
          console.log(`[PRODUCTOS]  Error en página ${currentPage}`);
          break;
        }

        console.log(`[PRODUCTOS]  Página ${currentPage}: ${response.data.length} productos`);
        totalApiProducts += response.data.length;
        
        // Agregar productos al Map (deduplicación automática)
        for (const product of response.data) {
          if (product.id && !uniqueProductsMap.has(product.id)) {
            uniqueProductsMap.set(product.id, product);
          }
        }
        
        // Obtener información de paginación
        totalPages = response.last_page || 1;
        //console.log(`[PRODUCTOS]  Paginación: ${currentPage}/${totalPages}`);
        
        currentPage++;
      } while (currentPage <= totalPages);

      // Convertir Map a Array
      const allProducts = Array.from(uniqueProductsMap.values());
      
      //console.log(`[PRODUCTOS]  RESUMEN DE OBTENCIÓN:`);
      //console.log(`[PRODUCTOS]  Total de la API: ${totalApiProducts} productos`);
      //console.log(`[PRODUCTOS]  Únicos después deduplicación: ${allProducts.length} productos`);
      //console.log(`[PRODUCTOS]  Duplicados eliminados: ${totalApiProducts - allProducts.length}`);
      
      if (allProducts.length === 0) {
        console.log("[PRODUCTOS]  No se encontraron productos");
        return interaction.editReply({
          embeds: [{
            title: " Sin Productos",
            description: "No hay productos disponibles en este momento.",
            color: 0xff9500,
            timestamp: new Date()
          }]
        });
      }

      // Procesar productos y crear catálogo final
      const finalCatalog = new Map(); // Para evitar duplicados en el catálogo final

      //console.log("[PRODUCTOS]  Procesando catálogo final...");
      for (let i = 0; i < allProducts.length; i++) {
        const product = allProducts[i];
        console.log(`[PRODUCTOS]  Procesando ${i + 1}/${allProducts.length}: ${product.name} (ID: ${product.id})`);
        
        if (product.variants && product.variants.length > 0) {
          // Producto con variantes
          console.log(`[PRODUCTOS]  ${product.variants.length} variantes encontradas`);
          for (const variant of product.variants) {
            const uniqueId = `${product.id}-v${variant.id}`;
            
            if (!finalCatalog.has(uniqueId)) {
              const variantName = variant.name === product.name ? 
                product.name : 
                `${product.name} - ${variant.name}`;
              
              finalCatalog.set(uniqueId, {
                id: uniqueId,
                name: variantName,
                price: variant.price || product.price || 0,
                stock: variant.stock || 0,
                description: variant.description || product.description || "Sin descripción",
                image: product.image || product.images?.[0]?.url || null,
                path: product.path,
                category: product.category || "General",
                productName: product.name,
                variantName: variant.name,
                type: "variant"
              });
              
              //console.log(`[PRODUCTOS]  Variante agregada: ${variantName} (Stock: ${variant.stock || 0})`);
            }
          }
        } else {
          // Producto sin variantes
          const uniqueId = `${product.id}-single`;
          
          if (!finalCatalog.has(uniqueId)) {
            finalCatalog.set(uniqueId, {
              id: uniqueId,
              name: product.name,
              price: product.price || 0,
              stock: product.stock_count || product.stock || 0,
              description: product.description || "Sin descripción",
              image: product.image || product.images?.[0]?.url || null,
              path: product.path,
              category: product.category || "General",
              productName: product.name,
              variantName: null,
              type: "single"
            });
            
            //console.log(`[PRODUCTOS]  Producto único agregado: ${product.name} (Stock: ${product.stock_count || product.stock || 0})`);
          }
        }
      }

      // Convertir a array y ordenar
      const allVariants = Array.from(finalCatalog.values());
      
      //console.log(`[PRODUCTOS]  CATÁLOGO FINAL COMPLETADO:`);
      //console.log(`[PRODUCTOS]  Productos base únicos: ${allProducts.length}`);
      //console.log(`[PRODUCTOS]  Elementos en catálogo: ${allVariants.length}`);
      //console.log(`[PRODUCTOS]  Productos únicos: ${allVariants.filter(v => v.type === "single").length}`);
      //console.log(`[PRODUCTOS]  Variantes: ${allVariants.filter(v => v.type === "variant").length}`);

      // Ordenar por stock (disponibles primero) y luego por nombre
      allVariants.sort((a, b) => {
        if (a.stock > 0 && b.stock === 0) return -1;
        if (a.stock === 0 && b.stock > 0) return 1;
        return a.name.localeCompare(b.name);
      });

      // Dividir en páginas (5 productos por página)
      const itemsPerPage = 5;
      const totalPagesEmbed = Math.ceil(allVariants.length / itemsPerPage);
      let currentPageEmbed = 0;

      const generateEmbed = (page) => {
        const start = page * itemsPerPage;
        const end = start + itemsPerPage;
        const pageVariants = allVariants.slice(start, end);

        const embed = new EmbedBuilder()
          .setTitle(" **CINASELL - CATÁLOGO COMPLETO**")
          .setDescription(`Lista completa de productos disponibles en nuestra tienda.\n\n** Total de productos:** ${allVariants.length}\n** Con stock:** ${allVariants.filter(v => v.stock > 0).length} | ** Agotados:** ${allVariants.filter(v => v.stock === 0).length}`)
          .setColor(0x00ff00)
          .setThumbnail("https://cinasell.es/favicon.ico")
          .setFooter({
            text: `Página ${page + 1} de ${totalPagesEmbed}  Cinasell`,
            iconURL: "https://cinasell.es/favicon.ico"
          })
          .setTimestamp();

        for (const variant of pageVariants) {
          const stockStatus = variant.stock > 0 ? 
            ` **${variant.stock} disponibles**` : 
            " **Agotado**";
          
          const price = variant.price > 0 ? ` **$${variant.price}**` : " **Ver precio**";
          
          const buyLink = variant.path ? 
            `[ Comprar](https://cinasell.es/product/${variant.path})` : 
            `[ Ver en tienda](https://cinasell.es)`;

          const typeIcon = variant.type === "variant" ? "" : "";

          embed.addFields({
            name: `${typeIcon} ${variant.name}`,
            value: `${stockStatus}\n${price}\n ${variant.description.substring(0, 80)}${variant.description.length > 80 ? "..." : ""}\n${buyLink}`,
            inline: true
          });
        }

        return embed;
      };

      const generateComponents = (page) => {
        const components = [];

        // Botones de navegación
        if (totalPagesEmbed > 1) {
          const navigationRow = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId("productos_first")
                .setLabel(" Primera")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 0),
              new ButtonBuilder()
                .setCustomId("productos_prev")
                .setLabel(" Anterior")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === 0),
              new ButtonBuilder()
                .setCustomId("productos_info")
                .setLabel(`${page + 1}/${totalPagesEmbed}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
              new ButtonBuilder()
                .setCustomId("productos_next")
                .setLabel("Siguiente ")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === totalPagesEmbed - 1),
              new ButtonBuilder()
                .setCustomId("productos_last")
                .setLabel("Última ")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === totalPagesEmbed - 1)
            );
          components.push(navigationRow);
        }

        // Botón de actualizar
        const actionRow = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId("productos_refresh")
              .setLabel(" Actualizar Stock")
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setLabel(" Visitar Cinasell")
              .setStyle(ButtonStyle.Link)
              .setURL("https://cinasell.es")
          );
        components.push(actionRow);

        return components;
      };

      const message = await interaction.editReply({
        embeds: [generateEmbed(currentPageEmbed)],
        components: generateComponents(currentPageEmbed)
      });

      // Collector para botones
      const collector = message.createMessageComponentCollector({
        time: 300000 // 5 minutos
      });

      collector.on("collect", async (buttonInteraction) => {
        if (buttonInteraction.user.id !== interaction.user.id) {
          return buttonInteraction.reply({
            content: " Solo quien ejecutó el comando puede usar estos botones.",
            ephemeral: true
          });
        }

        await buttonInteraction.deferUpdate();

        switch (buttonInteraction.customId) {
          case "productos_first":
            currentPageEmbed = 0;
            break;
          case "productos_prev":
            currentPageEmbed = Math.max(0, currentPageEmbed - 1);
            break;
          case "productos_next":
            currentPageEmbed = Math.min(totalPagesEmbed - 1, currentPageEmbed + 1);
            break;
          case "productos_last":
            currentPageEmbed = totalPagesEmbed - 1;
            break;
          case "productos_refresh":
            // Recargar datos con la misma lógica robusta
            try {
              console.log("[PRODUCTOS]  Actualizando catálogo completo...");
              
              // Obtener datos frescos
              const newUniqueProductsMap = new Map();
              let newCurrentPage = 1;
              let newTotalPages = 1;

              do {
                const newResponse = await sellauth.getProducts(newCurrentPage);
                if (newResponse && newResponse.data) {
                  for (const product of newResponse.data) {
                    if (product.id && !newUniqueProductsMap.has(product.id)) {
                      newUniqueProductsMap.set(product.id, product);
                    }
                  }
                  newTotalPages = newResponse.last_page || 1;
                }
                newCurrentPage++;
              } while (newCurrentPage <= newTotalPages);

              const newAllProducts = Array.from(newUniqueProductsMap.values());
              console.log(`[PRODUCTOS]  Datos actualizados: ${newAllProducts.length} productos únicos`);
              
              if (newAllProducts.length > 0) {
                // Reconstruir catálogo
                const newFinalCatalog = new Map();
                
                for (const product of newAllProducts) {
                  if (product.variants && product.variants.length > 0) {
                    for (const variant of product.variants) {
                      const uniqueId = `${product.id}-v${variant.id}`;
                      if (!newFinalCatalog.has(uniqueId)) {
                        newFinalCatalog.set(uniqueId, {
                          id: uniqueId,
                          name: variant.name === product.name ? product.name : `${product.name} - ${variant.name}`,
                          price: variant.price || product.price || 0,
                          stock: variant.stock || 0,
                          description: variant.description || product.description || "Sin descripción",
                          image: product.image || product.images?.[0]?.url || null,
                          path: product.path,
                          category: product.category || "General",
                          productName: product.name,
                          variantName: variant.name,
                          type: "variant"
                        });
                      }
                    }
                  } else {
                    const uniqueId = `${product.id}-single`;
                    if (!newFinalCatalog.has(uniqueId)) {
                      newFinalCatalog.set(uniqueId, {
                        id: uniqueId,
                        name: product.name,
                        price: product.price || 0,
                        stock: product.stock_count || product.stock || 0,
                        description: product.description || "Sin descripción",
                        image: product.image || product.images?.[0]?.url || null,
                        path: product.path,
                        category: product.category || "General",
                        productName: product.name,
                        variantName: null,
                        type: "single"
                      });
                    }
                  }
                }
                
                // Actualizar datos
                allVariants.length = 0;
                allVariants.push(...Array.from(newFinalCatalog.values()));
                
                allVariants.sort((a, b) => {
                  if (a.stock > 0 && b.stock === 0) return -1;
                  if (a.stock === 0 && b.stock > 0) return 1;
                  return a.name.localeCompare(b.name);
                });
                
                //console.log(`[PRODUCTOS]  Catálogo actualizado: ${allVariants.length} elementos`);
              }
            } catch (error) {
              console.error("[PRODUCTOS]  Error actualizando:", error);
            }
            break;
        }

        await buttonInteraction.editReply({
          embeds: [generateEmbed(currentPageEmbed)],
          components: generateComponents(currentPageEmbed)
        });
      });

      collector.on("end", () => {
        interaction.editReply({
          components: []
        }).catch(() => {});
      });

    } catch (error) {
      console.error(" Error en comando productos:", error);
      const errorEmbed = new EmbedBuilder()
        .setTitle(" Error")
        .setDescription("Ocurrió un error al obtener la lista de productos.")
        .setColor(0xff0000)
        .setTimestamp();

      if (interaction.deferred || interaction.replied) {
        interaction.editReply({ embeds: [errorEmbed] });
      } else {
        interaction.reply({ embeds: [errorEmbed] });
      }
    }
  },
};
