<script setup>
import { ref } from 'vue';


const formData = ref({
  nombre: '',
  centroFormacion: '',
  categoria: '',
  ubicacion: '',
  numeroSerie: '',
  estado: '',
  fechaAdquisicion: '',
  marca: '',
  modelo: '',
  codigoInventario: '',
  cuentadante: '',
});

const fabricante = ref({
  nombre: '',
  direccion: '',
  telefono: '',
});

const proveedor = ref({
  nombre: '',
  direccion: '',
  telefono: '',
});

const imagePreview = ref(null);
const categorias = ['Computo', 'Mobiliario', 'Herramientas', 'Equipos'];

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const onSubmit = () => {
  console.log('Form Data:', formData.value);
  console.log('Fabricante:', fabricante.value);
  console.log('Proveedor:', proveedor.value);
};
</script>

<template>
  <v-container class="bg-grey-lighten-4 py-8">
    <v-row justify="center">
      <v-col cols="12" md="10">
        <div class="d-flex align-center mb-6">
          <h1 class="text-h4 font-weight-bold" style="color: #39A900;">Inventarios</h1>
          <v-spacer></v-spacer>
          <img src="path-to-sena-logo.png" height="50" alt="SENA Logo" />
        </div>
        
        <h2 class="text-h5 mb-4">Registrar nuevo bien</h2>

        <v-card class="mb-6">
          <v-card-title class="text-h6 bg-success text-white">
            Datos del equipo
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.nombre"
                  label="Nombre"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.centroFormacion"
                  label="Centro de formación"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="formData.categoria"
                  :items="categorias"
                  label="Categoría"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.ubicacion"
                  label="Ubicación"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.numeroSerie"
                  label="Número de serie"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <!-- Image Upload Section -->
              <v-col cols="12" class="d-flex justify-center">
                <v-card width="200" class="text-center pa-4">
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleImageUpload"
                    style="display: none"
                    ref="fileInput"
                  >
                  <div 
                    @click="$refs.fileInput.click()"
                    class="cursor-pointer"
                  >
                    <v-img
                      v-if="imagePreview"
                      :src="imagePreview"
                      height="150"
                      cover
                    ></v-img>
                    <v-icon
                      v-else
                      size="100"
                      color="grey-lighten-1"
                    >
                      mdi-image-plus
                    </v-icon>
                    <div class="text-body-2 mt-2 text-success">
                      Cargar imagen del bien
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Fabricante Section -->
        <v-card class="mb-6">
          <v-card-title class="text-h6 bg-success text-white">
            Datos del fabricante
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="fabricante.nombre"
                  label="Nombre"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="fabricante.direccion"
                  label="Dirección"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="fabricante.telefono"
                  label="Teléfono"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Proveedor Section -->
        <v-card class="mb-6">
          <v-card-title class="text-h6 bg-success text-white">
            Datos del proveedor
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="proveedor.nombre"
                  label="Nombre"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="proveedor.direccion"
                  label="Dirección"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="proveedor.telefono"
                  label="Teléfono"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <div class="text-center">
          <v-btn
            color="success"
            size="large"
            @click="onSubmit"
          >
            Guardar
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.v-card-title.bg-success {
  background-color: #39A900 !important;
}
.text-success {
  color: #39A900 !important;
}
.cursor-pointer {
  cursor: pointer;
}
</style>