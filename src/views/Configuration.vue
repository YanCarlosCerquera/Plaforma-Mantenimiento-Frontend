<template>
  <div class="system-configuration">
    <v-row class="mb-4">
      <v-col cols="8">
        <h1 class="text-h4 font-weight-bold text-white">Configuración</h1>
      </v-col>
    </v-row>

    <!-- Contenedor principal -->
    <v-container class="pa-6 container-full-width" fluid>
      <!-- Sección de Parametrización -->
      <v-row>
        <v-col cols="12">
          <h3 class="text-h5 font-weight-bold mb-4">Parametrización</h3>
        </v-col>

        <!-- Primera fila en dos columnas -->
        <v-col cols="12" md="6">
          <v-btn outlined block class="custom-btn">
            <span>Gestión de centro de formación</span>
            <i class="fa fa-chevron-right"></i>
          </v-btn>
        </v-col>
        <v-col cols="12" md="6">
          <v-btn outlined block class="custom-btn">
            <span>Gestión de roles</span>
            <i class="fa fa-chevron-right"></i>
          </v-btn>
        </v-col>

        <!-- Segunda fila en dos columnas -->
        <v-col cols="12" md="6">
          <v-btn outlined block class="custom-btn">
            <span>Gestión de dependencias</span>
            <i class="fa fa-chevron-right"></i>
          </v-btn>
        </v-col>
        <v-col cols="12" md="6">
          <v-btn outlined block class="custom-btn">
            <span>Asignación de permisos</span>
            <i class="fa fa-chevron-right"></i>
          </v-btn>
        </v-col>

        <!-- Último botón de parametrización CENTRADO -->
        <v-col cols="12" class="d-flex justify-center">
          <v-btn outlined class="custom-btn custom-btn-centered">
            <span>Gestión de rutas</span>
            <i class="fa fa-chevron-right"></i>
          </v-btn>
        </v-col>
      </v-row>

      <!-- Sección de Registros del sistema (ocupa todo el ancho) -->
      <v-row>
        <v-col cols="12">
          <h3 class="text-h5 font-weight-bold mb-4">Registros del sistema</h3>
        </v-col>

        <v-col cols="12">
          <v-btn outlined block class="custom-btn">
            <span>Eventos del sistema</span>
            <i class="fa fa-chevron-right"></i>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

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

/* Botones con tamaño normal */
.custom-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  min-height: 48px;
  padding: 12px 20px;
  border-radius: 6px;
  border: 1px solid #4caf50;
  color: #4caf50;
  transition: all 0.3s ease;
  background: transparent;
}

/* Hover anterior restaurado */
.custom-btn:hover {
  background-color: transparent;
  border-color: #388e3c;
  color: #388e3c;
}

/* Ícono del botón */
.custom-btn i {
  color: #4caf50;
  margin-left: auto;
}

/* Ícono cambia de color en hover */
.custom-btn:hover i {
  color: #388e3c;
}

/* Último botón centrado */
.custom-btn-centered {
  width: 50%;
}
</style>