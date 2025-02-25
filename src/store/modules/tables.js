import apiService from '../../service/apiService';

export default {
  namespaced: true,
  
  state: {
    tableData: {},
    loading: {},
    error: {},
    formatters: {},
    filters: {},
    originalData: {}
  },

  mutations: {
    SET_TABLE_DATA(state, { tableId, data }) {
      state.tableData[tableId] = data;
    },
    SET_ORIGINAL_DATA(state, { tableId, data }) {
      state.originalData[tableId] = data;
    },
    SET_LOADING(state, { tableId, status }) {
      state.loading[tableId] = status;
    },
    SET_ERROR(state, { tableId, error }) {
      state.error[tableId] = error;
    },
    SET_FORMATTERS(state, { tableId, formatters }) {
      state.formatters[tableId] = formatters;
    },
    SET_FILTERS(state, { tableId, filters }) {
      state.filters[tableId] = filters;
    },
    REMOVE_ITEM(state, { tableId, itemId }) {
      if (state.tableData[tableId]) {
        state.tableData[tableId] = state.tableData[tableId].filter(item => 
          item._id !== itemId
        );
      }
      if (state.originalData[tableId]) {
        state.originalData[tableId] = state.originalData[tableId].filter(item => 
          item._id !== itemId
        );
      }
    }
  },

  actions: {
    async fetchTableData({ commit }, { tableId, endpoint, formatters = {} }) {
      commit('SET_LOADING', { tableId, status: true });
      try {
        const response = await apiService.get(endpoint);
        const rawData = response.data || response;
        const processedData = Array.isArray(rawData) ? rawData : [rawData];
        
        commit('SET_FORMATTERS', { tableId, formatters });
        
        const formattedData = processedData.map(item => {
          const newItem = { ...item };
          Object.entries(formatters).forEach(([field, formatter]) => {
            if (item[field] !== undefined) {
              newItem[field] = formatter(item[field], item);
            }
          });
          return newItem;
        });

        commit('SET_ORIGINAL_DATA', { tableId, data: formattedData });
        commit('SET_TABLE_DATA', { tableId, data: formattedData });
        commit('SET_ERROR', { tableId, error: null });
        return { success: true, data: formattedData };
      } catch (error) {
        console.error(`Error fetching data for ${tableId}:`, error);
        commit('SET_ERROR', { tableId, error: error.message });
        return { success: false, error };
      } finally {
        commit('SET_LOADING', { tableId, status: false });
      }
    },

    async deleteTableItem({ commit }, { tableId, endpoint, itemId }) {
      try {
        await apiService.delete(`${endpoint}/${itemId}`);
        commit('REMOVE_ITEM', { tableId, itemId });
        return { success: true };
      } catch (error) {
        console.error(`Error deleting item from ${tableId}:`, error);
        return { success: false, error };
      }
    },

    applyFilters({ commit, state }, { tableId, filters }) {
      const originalData = state.originalData[tableId] || [];
      
      if (!filters || Object.keys(filters).length === 0) {
        commit('SET_TABLE_DATA', { tableId, data: originalData });
        return;
      }

      const filteredData = originalData.filter(item => {
        return Object.entries(filters).every(([field, selectedValues]) => {
          if (!selectedValues || selectedValues.length === 0) return true;
          const value = field.includes('.') ? 
            field.split('.').reduce((obj, key) => obj?.[key], item) :
            item[field];
          return selectedValues.includes(value);
        });
      });

      commit('SET_TABLE_DATA', { tableId, data: filteredData });
    },

    clearTableData({ commit }, tableId) {
      commit('SET_TABLE_DATA', { tableId, data: [] });
      commit('SET_ORIGINAL_DATA', { tableId, data: [] });
    }
  },

  getters: {
    getTableData: state => tableId => state.tableData[tableId] || [],
    isTableLoading: state => tableId => state.loading[tableId] || false,
    getTableError: state => tableId => state.error[tableId] || null,
    getFormatters: state => tableId => state.formatters[tableId] || {},
    getFilters: state => tableId => state.filters[tableId] || {}
  }
};

// Funciones de formato comunes
export const commonFormatters = {
  date: (dateString) => {
    if (!dateString) return "";
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(dateString)
      .toLocaleDateString("es-ES", options)
      .replace(".", "");
  },
  
  status: (status) => status === false ? "Inactivo" : "Activo",
  
  workOrderStatus: (status) => status === false ? "No Asignado" : "Asignado",
  
  categoryName: (category) => category?.name || 'Sin categoría'
};
