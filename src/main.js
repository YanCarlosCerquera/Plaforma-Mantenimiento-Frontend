import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import "./assets/css/nucleo-icons.css";
import "./assets/css/nucleo-svg.css";
import ArgonDashboard from "./argon-dashboard";
import '../node_modules/flowbite-vue/dist/index.css'
import 'vuetify/styles'; 
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
const appInstance = createApp(App);
const vuetify = createVuetify({
    components,
    directives,
  });
appInstance.use(store);
appInstance.use(router);
appInstance.use(vuetify);
appInstance.use(ArgonDashboard);
appInstance.mount("#app");