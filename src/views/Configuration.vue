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
      <!-- Título y logo fuera del contenedor blanco -->
      <v-row align="center" class="mb-4">
        <v-col cols="8">
          <h1 class="text-h5 font-weight-bold text-primary">Configuración</h1>
          
        </v-col>
  
        <!-- Logo en la parte superior derecha -->
        <v-col cols="4" class="d-flex justify-end">
          <v-img
            src=""
            max-width="60"
            alt="Logo SENA"
          ></v-img>
        </v-col>
      </v-row>
  
      <!-- Contenedor blanco -->
      <v-container
        class="pa-6"
        style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);"
      >
        <!-- Sección de Parametrización -->
        <v-row>
          <v-col cols="12">
            <h3 class="text-h6 font-weight-bold">Parametrización</h3>
          </v-col>
          <!-- Botones de parametrización con iconos -->
          <v-col cols="12" md="6" lg="6">
            <v-btn outlined block class="pa-4 text-body-1" style="border: 1px solid black;">
                Gestión de centro de formación
                <v-icon  style="color: black;" icon="fa-solid fa-chevron-right" ></v-icon>
            </v-btn>
          </v-col>
          <v-col cols="12" md="6" lg="6">
            <v-btn outlined block class="pa-4 text-body-1" style="border: 1px solid black;">
                Gestión de roles
              <v-icon right style="color: black;" icon="fa-solid fa-chevron-right"></v-icon>
            </v-btn>
          </v-col>
          <v-col cols="12" md="6" lg="6">
            <v-btn outlined block class="pa-4 text-body-1" style="border: 1px solid black;">
                Gestión de dependencias
              <v-icon  style="color: black;" icon="fa-solid fa-chevron-right"></v-icon>
            </v-btn>
          </v-col>
          <v-col cols="12" md="6" lg="6">
            <v-btn outlined block class="pa-4 text-body-1" style="border: 1px solid black;">
                Asignación de permisos
              <v-icon  style="color: black;" icon="fa-solid fa-chevron-right"></v-icon>
            </v-btn>
          </v-col>
          <v-col cols="12" md="6" lg="6">
            <v-btn outlined block class="pa-4 text-body-1" style="border: 1px solid black;">
                Gestión de rutas
              <v-icon  style="color: black;" icon="fa-solid fa-chevron-right"></v-icon>
            </v-btn>
          </v-col>
        </v-row>
  
        <!-- Sección de Registros del sistema -->
        <v-row class="mt-6">
          <v-col cols="12">
            <h3 class="text-h6 font-weight-bold">Registros del sistema</h3>
          </v-col>
  
          <v-col cols="12" md="12" lg="12">
            <v-btn outlined block class="pa-4 text-body-1" style="border: 1px solid black;">
                Eventos del sistema
              <v-icon left style="color: black;" icon="fa-solid fa-chevron-right"></v-icon>
            </v-btn>
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
  .text-primary {
    color: #4caf50; /* Color verde para el título */
  }
  .system-configuration {
    background-color: #f5f5f5; /* Fondo general para destacar el contenedor */
    padding: 24px;
  }
  </style>