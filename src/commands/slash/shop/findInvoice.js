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
        .setName('findinvoice')
        .setDescription('Busca facturas por email, unique_id o ID de producto y muestra resumen + navegación por facturas.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Email, unique_id o ID de producto')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const idRaw = interaction.options.getString('id');
        const id = idRaw.toLowerCase();
        const perPage = 100;

        try {
            // Obtener todas las facturas
            const allInvoices = [];
            let currentPage = 1;
            let lastPage = 1;

            do {
                const response = await sellauth.getInvoices(currentPage, perPage);
                const pageItems = response?.data?.length ? response.data : (response?.data?.data || []);
                lastPage = response?.last_page || response?.data?.meta?.last_page || currentPage;

                if (pageItems.length) allInvoices.push(...pageItems);
                currentPage++;
            } while (currentPage <= lastPage);

            if (!allInvoices.length) {
                return interaction.followUp({ content: '❌ No hay facturas en el sistema.', ephemeral: true });
            }

            // Filtrar facturas
            const filtered = allInvoices.filter(inv => {
                const item = inv.items?.[0];
                const emailMatch = inv.email?.toLowerCase().includes(id);
                const uidMatch = inv.unique_id?.toLowerCase().includes(id);
                const productMatch = item?.product?.id?.toString() === id;
                return emailMatch || uidMatch || productMatch;
            });

            if (!filtered.length) {
                return interaction.followUp({ content: '❌ No se encontraron facturas que coincidan.', ephemeral: true });
            }

            // Funciones auxiliares
            const euro = (n) => typeof n === 'number'
                ? n.toFixed(2) + ' €'
                : Number(n)?.toFixed(2) + ' €';

            const formatStatus = status =>
                status === 'completed' ? '✅ Completada'
                    : status === 'pending' ? '⏳ Pendiente'
                        : `❔ ${status || 'desconocido'}`;

            const buildProductsSummary = (invoices) => {
                const map = new Map();
                let totalSpent = 0;
                let totalQty = 0;

                for (const inv of invoices) {
                    const items = inv.items || [];
                    const invPaid = Number(inv.paid) || 0;
                    totalSpent += invPaid;

                    for (const it of items) {
                        const key = `${it.product?.id || 'N/A'}|${it.product?.name || 'Producto'}`;
                        const prev = map.get(key) || { qty: 0, times: 0 };
                        const qty = Number(it.quantity) || 0;

                        prev.qty += qty;
                        prev.times += 1;
                        totalQty += qty;
                        map.set(key, prev);
                    }
                }

                const entries = [...map.entries()].sort((a, b) => b[1].qty - a[1].qty);
                return { entries, totalSpent, totalQty };
            };

            const { entries, totalSpent, totalQty } = buildProductsSummary(filtered);

            const generateSummaryEmbed = () => {
                const emailShown = filtered.find(f => f.email)?.email || idRaw;
                const lines = entries.slice(0, 15).map(([key, v], idx) => {
                    const [pid, pname] = key.split('|');
                    return `**${idx + 1}.** \`${pid}\` — **${pname}** • Sales: ${v.times}`;
                });

                return new EmbedBuilder()
                    .setColor(0x9b59b6)
                    .setTitle(`🧾 Resumen de compras — ${emailShown}`)
                    .setDescription(lines.length ? lines.join('\n') : 'No hay productos asociados a este correo.')
                    .addFields(
                        { name: '💸 Total gastado', value: euro(totalSpent), inline: true },
                        { name: '🧾 Facturas encontradas', value: `${filtered.length}`, inline: true }
                    )
                    .setFooter({ text: `Generado • hoy a las ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` });
            };

            const generateInvoiceEmbed = (invoice, index, total) => {
                const item = invoice.items?.[0] || {};
                const fecha = new Date(invoice.created_at).toLocaleString('es-ES', {
                    day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });

                return new EmbedBuilder()
                    .setColor(0x9b59b6)
                    .setTitle(`<:cinastar:1399479064749674527> ${item.product?.name || 'Producto'}${item.variant?.name ? ` (${item.variant.name})` : ''}`)
                    .addFields(
                        { name: '🆔 ID Invoice', value: `\`#${invoice.unique_id}\``, inline: false },
                        { name: '📦 Producto', value: `ID: \`${item.product?.id ?? 'N/A'}\``, inline: true },
                        { name: '🛒 Cantidad', value: `${item.quantity ?? 'N/A'}`, inline: true },
                        { name: '🏷️ Cupón', value: invoice.coupon_code || 'N/A', inline: true },
                        { name: '💳 Método', value: invoice.gateway || 'N/A', inline: true },
                        { name: '💰 Pagado', value: euro(invoice.paid), inline: true },
                        { name: '📧 Email', value: invoice.email || 'N/A', inline: true },
                        { name: '🌍 País', value: invoice.country_code || 'N/A', inline: true },
                        { name: '📅 Fecha', value: fecha, inline: true },
                        { name: '📌 Estado', value: formatStatus(invoice.status), inline: true }
                    )
                    .setFooter({ text: `Factura ${index + 1} de ${total}` });
            };

            const createButtons = (index, total, disable = false) => {
                return new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('⬅️ Anterior')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(disable || (index <= -1)),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('➡️ Siguiente')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(disable || index >= total - 1),
                    new ButtonBuilder()
                        .setCustomId('summary')
                        .setLabel('📊 Ver resumen')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(disable || index === -1)
                );
            };

            // Estado inicial → resumen
            let page = -1; // -1 = resumen
            const msg = await interaction.editReply({
                embeds: [generateSummaryEmbed()],
                components: [createButtons(page, filtered.length)]
            });

            // Collector
            const collector = msg.createMessageComponentCollector({
                filter: i => i.user.id === interaction.user.id,
                time: 600_000
            });

            collector.on('collect', async (i) => {
                await i.deferUpdate();

                if (i.customId === 'prev') page = Math.max(-1, page - 1);
                if (i.customId === 'next') page = Math.min(filtered.length - 1, page + 1);
                if (i.customId === 'summary') page = -1;

                await interaction.editReply({
                    embeds: [
                        page === -1
                            ? generateSummaryEmbed()
                            : generateInvoiceEmbed(filtered[page], page, filtered.length)
                    ],
                    components: [createButtons(page, filtered.length)]
                });
            });

            collector.on('end', async () => {
                await interaction.editReply({
                    embeds: [
                        page === -1
                            ? generateSummaryEmbed()
                            : generateInvoiceEmbed(filtered[page], page, filtered.length)
                    ],
                    components: [createButtons(page, filtered.length, true)]
                });
            });

        } catch (err) {
            console.error(err);
            return interaction.followUp({ content: '❌ Hubo un error buscando facturas.', ephemeral: true });
        }
    }
};
