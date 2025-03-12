import { createStore } from "vuex";
import assets from './modules/assets';
import tables from './modules/tables';
import Cookies from 'js-cookie';

export default createStore({
  modules: {
    assets,
    tables
  },
  state: {
    hideConfigButton: false,
    isPinned: false,
    showConfig: false,
    sidebarType: "bg-white",
    isRTL: false,
    mcolor: "",
    darkMode: false,
    isNavFixed: false,
    isAbsolute: false,
    showNavs: true,
    showSidenav: true,
    showNavbar: true,
    showFooter: true,
    showMain: true,
    layout: "default",
    authToken: Cookies.get("authToken") || null,
  },
  mutations: {
    setAuthToken(state, token) {
      state.authToken = token;
      if (token) {
        Cookies.set("authToken", token);
      } else {
        Cookies.remove("authToken");
      }
    },
    toggleConfigurator(state) {
      state.showConfig = !state.showConfig;
    },
    sidebarMinimize(state) {
      let sidenav_show = document.querySelector("#app");
      if (state.isPinned) {
        sidenav_show.classList.add("g-sidenav-hidden");
        sidenav_show.classList.remove("g-sidenav-pinned");
        state.isPinned = false;
      } else {
        sidenav_show.classList.add("g-sidenav-pinned");
        sidenav_show.classList.remove("g-sidenav-hidden");
        state.isPinned = true;
      }
    },
    sidebarType(state, payload) {
      state.sidebarType = payload;
    },
    navbarFixed(state) {
      if (state.isNavFixed === false) {
        state.isNavFixed = true;
      } else {
        state.isNavFixed = false;
      }
    },
  },
  actions: {
    toggleSidebarColor({ commit }, payload) {
      commit("sidebarType", payload);
    },
    login({ commit }, token) {
      commit("setAuthToken", token);
    },
    logout({ commit }) {
      commit("setAuthToken", null);
    },  
  },
  getters: {
    isAuth: (state) => !!state.authToken,
  },
});
