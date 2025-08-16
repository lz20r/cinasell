const axios = require('axios');

class SellAuthAPI {
    constructor() {
        this.authToken = process.env.SELLAUTH;
        this.shopId = process.env.SHOPID;
        this.baseURL = 'https://api.sellauth.com/v1'; // URL correcta de la API
        
        // Configurar headers por defecto
        this.headers = {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    // Obtener información de la tienda
    async getShopInfo() {
        try {
            const response = await axios.get(`${this.baseURL}/shops/${this.shopId}`, {
                headers: this.headers
            });
            return response.data;
        } catch (error) {
            console.error('Error obteniendo info de la tienda:', error.response?.data || error.message);
            throw error;
        }
    }

    // Obtener productos de la tienda con paginación (según documentación SellAuth)
    async getProducts(page = 1, perPage = 100) {
        try {
            const response = await axios.get(`${this.baseURL}/shops/${this.shopId}/products`, {
                headers: this.headers,
                data: {
                    page: page,
                    perPage: perPage
                }
            });
            
            //console.log(`[SELLAUTH]  Página ${page} solicitada (${perPage} productos por página)`);
            return response.data;
        } catch (error) {
            // Verificar si el error es HTML (protección anti-bot)
            if (error.response && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
                console.error('Error: Sellauth devolvió HTML - posible protección anti-bot');
                throw new Error('API bloqueada por protección anti-bot. Verifica tu token y URL.');
            }
            console.error(` Error obteniendo productos (página ${page}):`, error.response?.data || error.message);
            throw error;
        }
    }

    // Obtener producto específico
    async getProduct(productId) {
        try {
            const response = await axios.get(`${this.baseURL}/shops/${this.shopId}/products/${productId}`, {
                headers: this.headers
            });
            return response.data;
        } catch (error) {
            // Verificar si el error es HTML (protección anti-bot)
            if (error.response && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
                console.error('Error: Sellauth devolvió HTML - posible protección anti-bot');
                throw new Error('API bloqueada por protección anti-bot. Verifica tu token y URL.');
            }
            console.error('Error obteniendo producto:', error.response?.data || error.message);
            throw error;
        }
    }

    // Obtener categorías
    async getCategories() {
        try {
            const response = await axios.get(`${this.baseURL}/shops/${this.shopId}/categories`, {
                headers: this.headers
            });
            return response.data;
        } catch (error) {
            // Verificar si el error es HTML (protección anti-bot)
            if (error.response && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
                console.error('Error: Sellauth devolvió HTML - posible protección anti-bot');
                throw new Error('API bloqueada por protección anti-bot. Verifica tu token y URL.');
            }
            console.error('Error obteniendo categorías:', error.response?.data || error.message);
            throw error;
        }
    }

    // Obtener facturas (invoices)
    async getInvoices(page = 1, perPage = 100, filters = {}) {
        try {
            const params = {
                page,
                per_page: perPage,
                ...filters
            };

            const response = await axios.get(`${this.baseURL}/shops/${this.shopId}/invoices`, {
                headers: this.headers,
                params
            });

            return response.data;
        } catch (error) {
            console.error('Error obteniendo invoices:', error.response?.data || error.message);
            throw error;
        }
    }


    // Obtener estadísticas de la tienda
    async getShopStats() {
        try {
            const response = await axios.get(`${this.baseURL}/shops/${this.shopId}/statistics`, {
                headers: this.headers
            });
            return response.data;
        } catch (error) {
            // Verificar si el error es HTML (protección anti-bot)
            if (error.response && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
                console.error('Error: Sellauth devolvió HTML - posible protección anti-bot');
                throw new Error('API bloqueada por protección anti-bot. Verifica tu token y URL.');
            }
            console.error('Error obteniendo estadísticas:', error.response?.data || error.message);
            throw error;
        }
    }

    // Obtener stock de un producto
    async getProductStock(productId) {
        try {
            const response = await axios.get(`${this.baseURL}/shops/${this.shopId}/products/${productId}/stock`, {
                headers: this.headers
            });
            return response.data;
        } catch (error) {
            // Verificar si el error es HTML (protección anti-bot)
            if (error.response && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
                console.error('Error: Sellauth devolvió HTML - posible protección anti-bot');
                throw new Error('API bloqueada por protección anti-bot. Verifica tu token y URL.');
            }
            console.error('Error obteniendo stock:', error.response?.data || error.message);
            throw error;
        }
    }

    // Verificar conectividad con la API
    async testConnection() {
        try {
            const response = await axios.get(`${this.baseURL}/shops/${this.shopId}`, {
                headers: this.headers,
                timeout: 5000
            });
            return { success: true, data: response.data };
        } catch (error) {
            // Verificar si el error es HTML (protección anti-bot)
            if (error.response && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
                return { 
                    success: false, 
                    error: 'API bloqueada por protección anti-bot. Verifica tu token y URL.' 
                };
            }
            return { 
                success: false, 
                error: error.response?.data?.message || error.message 
            };
        }
    }

    // Simular restock (para testing)
    async simulateRestock(productData) {
        try {
            const webhookUrl = process.env.WEBHOOK_URL || 'http://localhost:3001';
            const response = await axios.post(`${webhookUrl}/webhook/sellauth/restock`, {
                shop_id: this.shopId,
                product_id: productData.id || '123',
                product_name: productData.name || 'Producto Test',
                product_price: productData.price || '9.99',
                stock_quantity: productData.stock || '5',
                product_image: productData.image || 'https://via.placeholder.com/300x200/00ff00/ffffff?text=RESTOCK+TEST',
                category_name: productData.category || 'General',
                event_type: 'product.restocked'
            });
            return response.data;
        } catch (error) {
            console.error('Error simulando restock:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = SellAuthAPI;
