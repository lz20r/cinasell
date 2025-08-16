const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const SellAuthAPI = require("../utils/sellauth");
const RestockChannel = require("../models/restockChannel");
const fs = require('fs').promises;
const path = require('path');

class RestockMonitor {
  constructor(client) {
    this.client = client;
    this.sellauth = new SellAuthAPI();
    this.previousVariantStock = new Map();
    this.isRunning = false;
    this.interval = null;
    this.stockFilePath = path.join(__dirname, '../data/stockHistory.json');
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    await this.loadStockHistory();
    await this.checkRestock();

    this.interval = setInterval(async () => {
      await this.checkRestock();
    }, 60000);
  }

  async stop() {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    await this.saveStockHistory();
  }

  async loadStockHistory() {
    try {
      const data = await fs.readFile(this.stockFilePath, 'utf8');
      const stockData = JSON.parse(data);

      if (stockData.variantStock) {
        for (const [key, value] of Object.entries(stockData.variantStock)) {
          this.previousVariantStock.set(key, value);
        }
      }

      //console.log(`[RESTOCK] Historial de stock cargado: ${this.previousVariantStock.size} variantes`);
    } catch {
      console.log("[RESTOCK] No se encontró historial de stock previo, iniciando desde cero");
    }
  }

  async saveStockHistory() {
    try {
      const stockData = {
        variantStock: Object.fromEntries(this.previousVariantStock),
        lastUpdate: new Date().toISOString()
      };

      await fs.writeFile(this.stockFilePath, JSON.stringify(stockData, null, 2));
      //console.log("[RESTOCK] Historial de stock guardado en archivo");
    } catch (error) {
      console.error("[RESTOCK] Error guardando historial de stock:", error);
    }
  }

  async checkRestock() {
    try {
      //console.log("[RESTOCK] Verificando stock...");
      const connectionTest = await this.sellauth.testConnection();
      if (!connectionTest) return console.log("[RESTOCK] No se pudo conectar con la API de Sellauth");

      const products = await this.sellauth.getProducts();
      if (!products || !products.data) return console.log("[RESTOCK] No se pudieron obtener productos");

      for (const product of products.data) {
        await this.checkProductStock(product);
      }

      await this.saveStockHistory();
    } catch (error) {
      console.error("[RESTOCK] Error verificando stock:", error.message);
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setTimeout(() => {}, 5 * 60 * 1000);
      }
    }
  }

  async checkProductStock(product) {
    try {
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          await this.checkVariantStock(product, variant);
        }
      } else {
        const virtualVariant = {
          id: 'default',
          name: product.name,
          stock: product.stock || 0,
          price: product.price
        };
        await this.checkVariantStock(product, virtualVariant);
      }
    } catch (error) {
      console.error(`[RESTOCK] Error verificando producto ${product.name}:`, error);
    }
  }

  async checkVariantStock(product, variant) {
    try {
      const variantKey = `${product.id}-${variant.id}`;
      const currentVariantStock = variant.stock || 0;
      const previousVariantStock = this.previousVariantStock.get(variantKey) || 0;

      if (currentVariantStock > previousVariantStock && currentVariantStock > 0) {
        const stockIncrease = currentVariantStock - previousVariantStock;
        //console.log(`[RESTOCK] Restock en "${variant.name}" (${product.name}): ${previousVariantStock} -> ${currentVariantStock} (+${stockIncrease})`);
        await this.sendRestockNotification(product, currentVariantStock, stockIncrease, variant);
      }

      this.previousVariantStock.set(variantKey, currentVariantStock);
    } catch (error) {
      console.error(`[RESTOCK] Error verificando variante ${variant.name}:`, error);
    }
  }

  async sendRestockNotification(product, currentStock, stockIncrease, variant) {
    try {
      const restockChannels = await RestockChannel.findAll({ where: { enabled: true } });
      if (!restockChannels.length) return console.log("[RESTOCK] No hay canales configurados para notificaciones");

      const embed = this.createRestockEmbed(product, currentStock, stockIncrease, variant);

      const productUrl = product.path
        ? `https://cinasell.es/product/${product.path}`
        : `https://cinasell.es`;

      const buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Buy now')
          .setStyle(ButtonStyle.Link)
          .setURL(productUrl)
          .setEmoji('1401153573449895969'),

        new ButtonBuilder()
          .setLabel('cinasell.es')
          .setStyle(ButtonStyle.Link)
          .setURL('https://cinasell.es')
          .setEmoji('1405493576988626964') 
      );

      for (const config of restockChannels) {

        try {
          const guild = this.client.guilds.cache.get(config.guildId);
          if (!guild) continue;

          const channel = guild.channels.cache.get(config.channelId);
          if (!channel) continue;

          let content;
          let allowedMentions;
          if (config.roleId) {
            content = `<@&${config.roleId}>`;
            allowedMentions = { parse: [], roles: [String(config.roleId)] };
          }

          await channel.send({
            content,
            embeds: [embed],
            components: [buttonRow],
            ...(allowedMentions ? { allowed_mentions: allowedMentions } : {})
          });

          //console.log(`[RESTOCK] Notificación enviada a ${guild.name} (#${channel.name})`);
        } catch (error) {
          console.error(`[RESTOCK] Error enviando a ${config.guildId}:`, error);
        }
      }

    } catch (error) {
      console.error("[RESTOCK] Error enviando notificaciones:", error);
    }
  }

  createRestockEmbed(product, currentStock, stockIncrease, variant) {
    let price = "Ver en tienda";
    if (variant?.price) price = `${variant.price}`;
    else if (product?.price) price = `${product.price}`;

    let serviceName = product.name;
    if (variant.id !== 'default' && variant.name !== product.name) {
      serviceName = `${product.name} - ${variant.name}`;
    }

    const embed = {
      title: " **<:cinastar:1399479064749674527> CINAS3LL - PRODUCT R3ST0CKED <:cinastar:1399479064749674527>**",
      description: `
🍿 **Service:** \`${serviceName}\`
📦 **Available stock:** \`${currentStock}\`
💰 **Price:** \`€${price}\`

ℹ️ **Information**
> We have recently restocked this product!
      `,
      color: this.generateColorFromString(product.id), // ✅ color dinámico único por producto
      timestamp: new Date(),
      thumbnail: {
        url: "https://cinasell.es/favicon.ico"
      },
      footer: {
        text: "Cinasell 240+ Product sold",
        icon_url: "https://cinasell.es/favicon.ico"
      },
      fields: []
    };

    // Imagen del producto
    let imageUrl = null;
    if (product.image?.startsWith('http')) {
      imageUrl = product.image;
    } else if (product.images?.length > 0) {
      const firstImage = product.images[0];
      if (firstImage.cloudflare_image_id) {
        imageUrl = `https://imagedelivery.net/HL_Fwm__tlvUGLZF2p74xw/${firstImage.cloudflare_image_id}/public`;
      } else if (firstImage.url) {
        imageUrl = firstImage.url;
      }
    } else if (product.image_url?.startsWith('http')) {
      imageUrl = product.image_url;
    }

    if (imageUrl) {
      embed.image = { url: imageUrl };
    }

    // Descripción y variante
    if (product.description?.length > 0) {
      embed.fields.unshift({
        name: " Descripción",
        value: product.description.length > 200
          ? product.description.substring(0, 200) + "..."
          : product.description,
        inline: false
      });
    }

    if (variant.id !== 'default' && variant.description) {
      embed.fields.push({
        name: " Detalles de la Variante",
        value: variant.description.length > 150
          ? variant.description.substring(0, 150) + "..."
          : variant.description,
        inline: false
      });
    }

    return embed;
  }

  // ✅ Función para generar un color único por producto
  generateColorFromString(string) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    const color = (hash & 0x00FFFFFF)
      .toString(16)
      .toUpperCase();

    return parseInt("0x" + ("000000" + color).slice(-6));
  }
}

module.exports = RestockMonitor;