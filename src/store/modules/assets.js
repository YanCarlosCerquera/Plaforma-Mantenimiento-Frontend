import apiService from '../../service/apiservice';

export default {
  namespaced: true,
  
  state: {
    assets: [],
    loading: false,
    error: null
  },

  mutations: {
    SET_ASSETS(state, assets) {
      state.assets = assets;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },

  actions: {
    async fetchAssets({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await apiService.get('/assets');
        const processedAssets = Array.isArray(response) ? response : [response];
        const mappedAssets = processedAssets.map(asset => ({
          ...asset,
          status: asset.status === false ? "Activo" : "Inactivo",
          categoryId: {
            name: asset.categoryId?.name || 'Sin categoría'
          }
        }));
        commit('SET_ASSETS', mappedAssets);
        commit('SET_ERROR', null);
      } catch (error) {
        console.error('Error fetching assets:', error);
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    }
  },

  getters: {
    getAssets: state => state.assets,
    isLoading: state => state.loading,
    getError: state => state.error
  }
};
