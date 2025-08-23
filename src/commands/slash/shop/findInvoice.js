const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");
const SellAuthAPI = require("../../../utils/sellauth");
const sellauth = new SellAuthAPI();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("findinvoice")
        .setDescription("Busca facturas por email, unique_id o ID de producto y muestra el resumen.")
        .addStringOption((option) =>
            option
                .setName("id")
                .setDescription("Email, unique_id o ID de producto")
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const idRaw = interaction.options.getString("id");
            const id = idRaw.toLowerCase();
            const perPage = 100;

            // Mapeo de precios de productos (id -> precio)
            const productPriceMap = {};
            // Mapeo de variantes por producto (id -> array de variantes)
            const productVariantsMap = {};

            // Helper para obtener precio real de la API
            async function fetchProductPrices(productIds) {
                for (const pid of productIds) {
                    if (!productPriceMap[pid]) {
                        try {
                            const prod = await sellauth.getProduct(pid);
                            // El precio puede estar en diferentes campos
                            let price = null;
                            if (prod?.data) {
                                price = prod.data.price ?? prod.data.price_amount;
                                if (price == null && prod.data.price_cents != null) price = prod.data.price_cents / 100;
                                // Variantes
                                if (Array.isArray(prod.data.variants)) {
                                    productVariantsMap[pid] = prod.data.variants.map(v => ({
                                        name: v.name || v.variant_name || "Variante",
                                        price: v.price ?? v.price_amount ?? (v.price_cents != null ? v.price_cents / 100 : null)
                                    }));
                                } else {
                                    productVariantsMap[pid] = [];
                                }
                            }
                            if (price !== null && price !== undefined) {
                                productPriceMap[pid] = Number(price);
                            }
                        } catch (e) {
                            productPriceMap[pid] = null;
                            productVariantsMap[pid] = [];
                        }
                    }
                }
            }

            // ————————————————————————————————————————————————
            // 1) Traer TODAS las facturas (paginación)
            // ————————————————————————————————————————————————
            const allInvoices = [];
            let currentPage = 1;
            let lastPage = 1;

            do {
                const response = await sellauth.getInvoices(currentPage, perPage);
                const pageItems = response?.data?.length
                    ? response.data
                    : response?.data?.data || [];
                lastPage =
                    response?.last_page ||
                    response?.data?.meta?.last_page ||
                    currentPage;

                if (pageItems.length) allInvoices.push(...pageItems);
                currentPage++;
            } while (currentPage <= lastPage);

            if (!allInvoices.length) {
                return interaction.followUp({
                    content: "❌ No hay facturas en el sistema.",
                    ephemeral: true,
                });
            }

            // ————————————————————————————————————————————————
            // 2) Filtrar por email / unique_id / productId (primer ítem del listado)
            // ————————————————————————————————————————————————
            const filtered = allInvoices.filter((inv) => {
                const firstItem = inv.items?.[0];
                const emailMatch = inv.email?.toLowerCase().includes(id);
                const uidMatch = inv.unique_id?.toLowerCase().includes(id);
                const productMatch = firstItem?.product?.id?.toString() === id;
                return emailMatch || uidMatch || productMatch;
            });

            if (!filtered.length) {
                return interaction.followUp({
                    content: "❌ No se encontraron facturas que coincidan.",
                    ephemeral: true,
                });
            }

            // ————————————————————————————————————————————————
            // 3) HIDRATAR: obtener detalle de cada factura para tener TODOS los items
            // ————————————————————————————————————————————————
            const hydrateInvoices = async (invoices) => {
                const results = [];
                for (const inv of invoices) {
                    try {
                        let full;
                        if (typeof sellauth.getInvoice === "function") {
                            full = await sellauth.getInvoice(inv.id);
                        } else if (typeof sellauth.getInvoiceById === "function") {
                            full = await sellauth.getInvoiceById(inv.id);
                        } else if (typeof sellauth.getInvoiceByUniqueId === "function") {
                            full = await sellauth.getInvoiceByUniqueId(inv.unique_id);
                        } else if (typeof sellauth.request === "function") {
                            full = await sellauth.request("GET", `/invoices/${inv.id}`);
                        } else {
                            full = { data: inv };
                        }
                        const payload = full?.data?.id
                            ? full.data
                            : (full?.data?.data?.id ? full.data.data : full?.data || full);
                        results.push({ ...inv, ...payload });
                    } catch (e) {
                        console.warn("No se pudo hidratar la factura", inv.id, e?.message);
                        results.push(inv);
                    }
                }
                return results;
            };

            const invoices = await hydrateInvoices(filtered);

            // ————————————————————————————————————————————————
            // 4) Helpers
            // ————————————————————————————————————————————————
            const euro = (n) =>
                typeof n === "number"
                    ? n.toFixed(2) + " €"
                    : Number(n || 0).toFixed(2) + " €";

            const formatStatus = (status) =>
                status === "completed"
                    ? "✅ Completada"
                    : status === "pending"
                        ? "⏳ Pendiente"
                        : `❔ ${status || "desconocido"}`;

            const pickNum = (...vals) => {
                for (const v of vals) {
                    const n = Number(v);
                    if (!Number.isNaN(n) && Number.isFinite(n)) return n;
                }
                return null;
            };

            // Convierte strings tipo "€2,39", "2.39", "2,39" o céntimos a número
            const toNumberOrNull = (v) => {
                if (v === null || v === undefined) return null;
                if (typeof v === "number") return Number.isFinite(v) ? v : null;
                if (typeof v === "string") {
                    const m = v.replace(/[^\d,.-]/g, "").replace(",", ".");
                    const n = Number(m);
                    return Number.isFinite(n) ? n : null;
                }
                return null;
            };

            // Busca el precio unitario de la variante en rutas comunes
            const getVariantUnitPrice = (it) => {
                const candidates = [
                    it?.variant?.price,
                    it?.variant?.data?.price,
                    it?.variant_price,
                    it?.variant?.price_amount,
                    (it?.variant?.price_cents != null ? it.variant.price_cents / 100 : null),
                    it?.meta?.variant?.price,
                    it?.metadata?.variant_price,
                    it?.unit_price_variant,
                ];
                for (const c of candidates) {
                    const n = toNumberOrNull(c);
                    if (n !== null) return n;
                }
                return null;
            };

            // Normaliza items: admite items, items.data, lines, etc.
            const getItemsArray = (invoice) => {
                const i = invoice?.items ?? invoice?.lines ?? invoice?.products ?? [];
                if (Array.isArray(i)) return i;
                if (Array.isArray(i?.data)) return i.data;
                if (i && typeof i === "object") {
                    const arr = Object.values(i).filter((v) => v && typeof v === "object");
                    if (arr.length) return arr;
                }
                return [];
            };

            // Construir índice lineal de TODOS los productos
            const flat = [];
            invoices.forEach((inv, invIdx) => {
                const items = getItemsArray(inv);
                items.forEach((it, itemIdx) => flat.push({ invIdx, itemIdx }));
            });

            const buildProductsSummary = (invs) => {
                const map = new Map();
                let totalSpent = 0;

                for (const inv of invs) {
                    const items = getItemsArray(inv);
                    totalSpent += Number(inv.paid) || 0;

                    for (const it of items) {
                        const key = `${it.product?.id || it.product_id || "N/A"}|${it.product?.name || it.name || "Producto"
                            }`;
                        const prev = map.get(key) || { qty: 0, times: 0 };
                        const qty = Number(it.quantity) || 0;

                        prev.qty += qty;
                        prev.times += 1;
                        map.set(key, prev);
                    }
                }

                const entries = [...map.entries()].sort((a, b) => b[1].qty - a[1].qty);
                return { entries, totalSpent };
            };

            const { entries, totalSpent } = buildProductsSummary(invoices);

            // Obtener los IDs únicos de productos del resumen y cargar precios
            const uniqueProductIds = Array.from(new Set(entries.map(([key]) => key.split("|")[0]).filter(pid => pid && pid !== "N/A")));
            await fetchProductPrices(uniqueProductIds);

            // ————————————————————————————————————————————————
            // 5) Embeds
            // ————————————————————————————————————————————————
            const generateSummaryEmbed = () => {
                const emailShown = invoices.find((f) => f.email)?.email || idRaw;
                const lines = entries.slice(0, 15).map(([key, v], idx) => {
                    const [pid, pname] = key.split("|");
                    const price = productPriceMap[pid];
                    const priceTxt = price !== undefined && price !== null ? ` — 💵 ${price.toFixed(2)} €` : "";
                    let line = `**${idx + 1}.** \`${pid}\` — **${pname}**${priceTxt} • Sales: ${v.times}`;
                    // Mostrar variantes si existen
                    const variants = productVariantsMap[pid] || [];
                    if (variants.length > 0) {
                        const variantsTxt = variants.map(va => `   - ${va.name}: ${va.price !== undefined && va.price !== null ? `${va.price.toFixed(2)} €` : "N/A"}`).join("\n");
                        line += `\n${variantsTxt}`;
                    }
                    return line;
                });

                // Resumen de cupones usados
                const couponMap = new Map();
                let totalDiscount = 0;
                for (const inv of invoices) {
                    const code = inv.coupon_code;
                    if (code) {
                        const prev = couponMap.get(code) || { count: 0, discount: 0 };
                        prev.count++;
                        // Buscar descuento aplicado (si existe)
                        let discount = 0;
                        if (inv.coupon_discount) {
                            discount = Number(inv.coupon_discount) || 0;
                        } else if (inv.discount_amount) {
                            discount = Number(inv.discount_amount) || 0;
                        }
                        prev.discount += discount;
                        totalDiscount += discount;
                        couponMap.set(code, prev);
                    }
                }
                let couponSummary = "Ninguno";
                if (couponMap.size > 0) {
                    couponSummary = Array.from(couponMap.entries())
                        .map(([code, v]) => `\`${code}\` — ${v.count} uso(s)${v.discount > 0 ? `, descuento total: ${euro(v.discount)}` : ""}`)
                        .join("\n");
                }

                return new EmbedBuilder()
                    .setColor(0x9b59b6)
                    .setTitle(`🧾 Resumen de compras — ${emailShown}`)
                    .setDescription(
                        lines.length ? lines.join("\n") : "No hay productos asociados a este correo."
                    )
                    .addFields(
                        { name: "💸 Total gastado", value: euro(totalSpent), inline: true },
                        { name: "🧾 Facturas encontradas", value: `${invoices.length}`, inline: true },
                        { name: "🛍️ Productos totales", value: `${flat.length}`, inline: true },
                        { name: "🏷️ Cupones usados", value: couponSummary, inline: false }
                    )
                    .setFooter({
                        text: `Generado • hoy a las ${new Date().toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}`,
                    });
            };

            // Embed de **producto individual** (con metadatos de su factura)
            const generateItemEmbed = (flatIdx) => {
                const { invIdx, itemIdx } = flat[flatIdx];
                const invoice = invoices[invIdx];
                const items = getItemsArray(invoice);
                const it = items[itemIdx] || {};
                // Log avanzado: mostrar el JSON completo del ítem y la variante
                console.log("ITEM JSON", JSON.stringify(it, null, 2));
                // Declarar solo una vez cada variable
                const pid = it.product?.id ?? it.product_id ?? "N/A";
                const pname = it.product?.name || it.name || "Producto";
                const vname = it.variant?.name || it.variant_name || "";
                const qty = pickNum(it.quantity, 1) || 1;
                const totalLine = pickNum(it.total, it.subtotal, it.amount);
                const variantUnit = getVariantUnitPrice(it);
                let unit = pickNum(variantUnit, it.unit_price, it.price);
                if ((unit === null || unit === 0) && totalLine !== null && qty) {
                    unit = totalLine / qty;
                }
                // Log después de todas las declaraciones
                console.log("VARIANT DEBUG", {
                    variant: it.variant,
                    variantUnit,
                    unit,
                    totalLine,
                    qty
                });

                const priceParts = [];
                if (variantUnit !== null) priceParts.push(`Variante: ${variantUnit.toFixed(2)} € c/u`);
                if (unit !== null && (variantUnit === null || unit !== variantUnit))
                    priceParts.push(`Producto: ${unit.toFixed(2)} € c/u`);
                if (totalLine !== null) priceParts.push(`**${totalLine.toFixed(2)} €**`);
                const priceTxt = priceParts.length ? priceParts.join(" • ") : "—";

                const fecha = new Date(invoice.created_at).toLocaleString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                });

                const embed = new EmbedBuilder()
                    .setColor(0x9b59b6)
                    .setTitle(`★ ${pname}${vname ? ` (${vname})` : ""}`)
                    .addFields(
                        { name: "🧾 Factura", value: `\`#${invoice.unique_id}\``, inline: false },
                        { name: "🆔 Producto", value: `\`${pid}\``, inline: true },
                        { name: "🛒 Cantidad", value: `${qty}`, inline: true },
                        { name: "💳 Método", value: invoice.gateway || "N/A", inline: true },
                        { name: "💰 Pago Total", value: euro(Number(invoice.paid) || 0), inline: true },
                        { name: "📌 Estado", value: formatStatus(invoice.status), inline: true },
                        { name: "📧 Email", value: invoice.email || "N/A", inline: true },
                        { name: "🌍 País", value: invoice.country_code || "N/A", inline: true },
                        { name: "📅 Fecha", value: fecha, inline: true },
                        { name: "🏷️ Cupón", value: invoice.coupon_code || "N/A", inline: true }
                    )
                    .setFooter({
                        text: `Producto ${itemIdx + 1} de ${items.length} • Factura ${invIdx + 1} de ${invoices.length}`,
                    });

                return embed;
            };

            // ————————————————————————————————————————————————
            // 6) Botonera (Resumen ↔ producto por producto)
            // ————————————————————————————————————————————————
            const createButtons = (mode, flatIdx, disable = false) => {
                // mode: 'summary' | 'items'
                const atStart = flatIdx <= 0;
                const atEnd = flatIdx >= flat.length - 1;

                return new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("prev")
                        .setLabel("⬅️ Anterior")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(disable || mode === "summary" || atStart),

                    new ButtonBuilder()
                        .setCustomId("next")
                        .setLabel(mode === "summary" ? "➡️ Ver productos" : "➡️ Siguiente")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(disable || (mode === "items" && atEnd)),

                    new ButtonBuilder()
                        .setCustomId("summary")
                        .setLabel("📊 Ver resumen")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(disable || mode === "summary")
                );
            };

            // ————————————————————————————————————————————————
            // 7) Estado inicial → RESUMEN
            // ————————————————————————————————————————————————
            let mode = "summary"; // 'summary' | 'items'
            let flatIdx = 0;      // índice del producto dentro del array plano

            const msg = await interaction.editReply({
                embeds: [generateSummaryEmbed()],
                components: [createButtons(mode, flatIdx)],
            });

            // ————————————————————————————————————————————————
            // 8) Collector
            // ————————————————————————————————————————————————
            const collector = msg.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id,
                time: 600_000,
            });

            collector.on("collect", async (i) => {
                await i.deferUpdate();

                if (i.customId === "summary") {
                    mode = "summary";
                } else if (i.customId === "next") {
                    if (mode === "summary") {
                        mode = "items"; // ir al primer producto
                        flatIdx = 0;
                    } else {
                        flatIdx = Math.min(flat.length - 1, flatIdx + 1);
                    }
                } else if (i.customId === "prev") {
                    if (mode === "items") {
                        flatIdx = Math.max(0, flatIdx - 1);
                    }
                }

                await interaction.editReply({
                    embeds: [
                        mode === "summary"
                            ? generateSummaryEmbed()
                            : generateItemEmbed(flatIdx),
                    ],
                    components: [createButtons(mode, flatIdx)],
                });
            });

            collector.on("end", async () => {
                await interaction.editReply({
                    embeds: [
                        mode === "summary"
                            ? generateSummaryEmbed()
                            : generateItemEmbed(flatIdx),
                    ],
                    components: [createButtons(mode, flatIdx, true)],
                });
            });
        } catch (err) {
            console.error(err);
            return interaction.followUp({
                content: "❌ Hubo un error buscando facturas.",
                ephemeral: true,
            });
        }
    },
};
