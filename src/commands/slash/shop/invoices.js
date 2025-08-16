const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const SellAuthAPI = require('../../../utils/sellauth');

const sellauth = new SellAuthAPI();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invoices')
    .setDescription('Displays all invoices one by one with style'),

  async execute(interaction) {
    await interaction.deferReply();

    let page = 1;
    const perPage = 100;
    let totalPages = 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formatStatus = (status) =>
      status === 'completed' ? ':white_check_mark: Completed'
        : status === 'pending' ? ':hourglass_flowing_sand: Pending'
          : `❔ ${status}`;

    const generateEmbed = (invoice, currentPage, total) => {
      const timestamp = Math.floor(new Date(invoice.created_at).getTime() / 1000);
      const items = invoice.items || [];

      const products = items.map(item => {
        const name = item.product?.name || 'Unknown product';
        const variant = item.variant?.name ? ` (${item.variant.name})` : '';
        const id = item.product?.id || 'N/A';
        return `• **${name}${variant}** — \`ID: ${id}\``;
      }).join('\n');

      return new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle(`🧾 #${invoice.unique_id}`)
        .addFields(
          { name: ':package: Products', value: products || 'N/A', inline: false },
          { name: ':shopping_cart: Items Count', value: `${items.length}`, inline: true },
          { name: ':bookmark: Coupon', value: invoice.coupon_code || 'N/A', inline: true },
          { name: ':credit_card: Method', value: invoice.gateway || 'N/A', inline: true },
          { name: ':moneybag: Price', value: `${invoice.paid} €`, inline: true },
          { name: ':e_mail: Email', value: invoice.email, inline: true },
          { name: ':earth_africa: Country', value: invoice.country_code || 'N/A', inline: true },
          { name: ':date: Date', value: `<t:${timestamp}:f>`, inline: true },
          { name: ':pushpin: Status', value: formatStatus(invoice.status), inline: true }
        )
        .setFooter({
          text: `Page ${currentPage} of ${total} • Updated at ${new Date().toLocaleTimeString('en-GB', {
            hour: '2-digit', minute: '2-digit'
          })}`
        });
    };

    const createButtons = (currentPage, total) =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('first')
          .setLabel('⏮️ First')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentPage <= 1),
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('⬅️ Previous')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentPage <= 1),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('➡️ Next')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentPage >= total),
        new ButtonBuilder()
          .setCustomId('last')
          .setLabel('⏭️ Last')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentPage >= total)
      );

    try {
      const allInvoices = [];
      let currentPage = 1;
      let lastPage = 1;

      do {
        const response = await sellauth.getInvoices(currentPage, perPage, {
          statuses: ['completed'],
          orderColumn: 'created_at',
          orderDirection: 'desc',
          created_at_end: new Date().toISOString()
        });

        const invoices = response?.data || [];

        const todayInvoices = invoices.filter(invoice => {
          const createdDate = new Date(invoice.created_at);
          return createdDate >= today;
        });

        if (todayInvoices.length > 0) {
          console.log(`🟣 Today's invoices on page ${currentPage}:`);
          todayInvoices.forEach(inv => {
            console.log(JSON.stringify(inv, null, 2));
          });
        }

        allInvoices.push(...invoices);
        lastPage = response.last_page || currentPage;
        currentPage++;
      } while (currentPage <= lastPage);

      totalPages = allInvoices.length;

      if (!allInvoices.length) {
        return interaction.followUp({
          content: '❌ No invoices available.',
          ephemeral: true
        });
      }

      const msg = await interaction.editReply({
        embeds: [generateEmbed(allInvoices[page - 1], page, totalPages)],
        components: [createButtons(page, totalPages)]
      });

      const collector = msg.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        time: 600_000
      });

      collector.on('collect', async (i) => {
        if (i.customId === 'first') page = 1;
        if (i.customId === 'prev') page = Math.max(1, page - 1);
        if (i.customId === 'next') page = Math.min(totalPages, page + 1);
        if (i.customId === 'last') page = totalPages;

        await i.update({
          embeds: [generateEmbed(allInvoices[page - 1], page, totalPages)],
          components: [createButtons(page, totalPages)]
        });
      });

    } catch (error) {
      console.error('❌ Error fetching invoices:', error);
      return interaction.followUp({
        content: '❌ Failed to fetch invoices.',
        ephemeral: true
      });
    }
  }
};
