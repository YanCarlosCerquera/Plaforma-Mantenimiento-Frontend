import { createStore } from 'vuex';

export default createStore({
  state: {
    selectedRequestId: null,
  },
  mutations: {
    setSelectedRequestId(state, _id) {
      state.selectedRequestId = _id;
    },
  },
  actions: {
    setSelectedRequestId({ commit }, _id) {
      commit('setSelectedRequestId', _id);
    },
  },
  getters: {
    selectedRequestId: (state) => state.selectedRequestId,
  },
});