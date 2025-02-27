<script setup>
import { createApp } from "vue";
import App from "../App.vue";
import { createVuetify } from "vuetify";
import "vuetify/styles"; // Importar estilos de Vuetify
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { useRouter } from "vue-router";
import 'font-awesome/css/font-awesome.min.css'
import '@fortawesome/fontawesome-free/css/all.css' // Ensure your project is capable of handling css files

const router = useRouter();
router.push("/configuration");

const vuetify = createVuetify({
  components,
  directives,
});

const app = createApp(App);
app.use(vuetify);
</script>

<template>
  <div class="system-configuration">
    <v-row class="mb-4">
      <v-col cols="8">
        <h1 class="text-h4 font-weight-bold text-white">Configuración</h1>
      </v-col>
    </v-row>

    <v-container
      class="pa-6 container-full-width"
      fluid
    >
      <v-row>
        <v-col cols="12">
          <h3 class="text-h5 font-weight-bold mb-4">Parametrización</h3>
        </v-col>

        <v-col cols="12" md="6">
          <router-link to="/rol" outlined block class="py-6 text-body-1 custom-btn mb-3">
            <span>Gestión de centro de formación</span>
            <i class="fa fa-chevron-right icon-end"></i>
          </router-link>
        </v-col>
        <v-col cols="12" md="6">
          <router-link to="/rol" outlined block class="py-6 text-body-1 custom-btn mb-3">
            <span>Gestión de roles</span>
            <i class="fa fa-chevron-right icon-end"></i>
          </router-link>
        </v-col>
        <v-col cols="12" md="6">
          <router-link to="/rol" outlined block class="py-6 text-body-1 custom-btn mb-3">
            <span>Gestión de dependencias</span>
            <i class="fa fa-chevron-right icon-end"></i>
          </router-link>
        </v-col>  
        <v-col cols="12" md="6">
          <router-link to="/rol" outlined block class="py-6 text-body-1 custom-btn mb-3">
            <span>Asignación de permisos</span>
            <i class="fa fa-chevron-right icon-end"></i>
          </router-link>
        </v-col>

        <v-col cols="12" md="6" class="mx-auto">
          <router-link to="/ruta" outlined block class="py-6 text-body-1 custom-btn mb-3">
            <span>Gestión de rutas</span>
            <i class="fa fa-chevron-right icon-end"></i>
          </router-link>
        </v-col>
      </v-row>
      
      <v-row>
        <v-col cols="12">
          <h3 class="text-h5 font-weight-bold mb-4">Registros del sistema</h3>
        </v-col>
        
        <v-col cols="12">
          <router-link to="/rol" outlined block class="py-6 text-body-1 custom-btn mb-3">
            <span>Eventos del sistema</span>
            <i class="fa fa-chevron-right icon-end"></i>
          </router-link>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "SystemConfiguration",
};
</script>

<style scoped>
.text-white {
  color: white !important;
}

.system-configuration {
  padding: 24px;
}

.container-full-width {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.custom-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  border-radius: 8px;
  border: 1px solid #4caf50;
  width: 100%; /* Asegura que todos los botones tengan el mismo ancho */
}

.custom-btn:hover {
  background-color: #4caf50;
  color: white !important;
}

.custom-btn:hover i {
  color: white !important;
}

.custom-btn i {
  color: #4caf50;
}

.icon-end {
  margin-left: auto; /* Empuja el ícono al final */
  padding-right: 16px; /* Espacio adicional al final */
}

/* Espacio vertical entre botones */
.mb-3 {
  margin-bottom: 16px !important;
}

/* Aumentar el tamaño vertical de los botones */
.py-6 {
  padding: 18px 8px !important;
}
</style>