<script setup>
import { ref, onMounted } from 'vue'
import { mdiEye, mdiEyeOff, mdiUpload } from '@mdi/js'
import apiService from '../service/apiService'

const user = ref({
  name: '',
  email: '',
  phone: '',
  assignedRol: '',
  assignedPosition: '',
  typeDocument: '',
  numberDocument: '',
  password: '',
  photoUrl: '',
})

const roles = ref([])
const assignedPosition = ['Contratista', 'Planta']
const documentTypes = ['Cédula de Ciudadanía', 'Tarjeta de Identidad', 'Cédula de Extranjería' ,'PEP','Permiso por Protección Temporal']

const passwordVisibility = ref({
  password: false,
  confirmPassword: false,
})

const toggleVisibility = (field) => {
  passwordVisibility.value[field] = !passwordVisibility.value[field]
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      user.value.image = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const getDataRol = async () => {
  try {
    const response = await apiService.get("/rol")
    console.log("API Response:", response) 
    if (response && Array.isArray(response)) {
      roles.value = response.map(assignedRol => ({
        value: assignedRol._id,
        text: assignedRol.name
      }))
      if (roles.value.length > 0) {
        user.value.assignedRol   = roles.value[0].value
      }
    }
  } catch (error) {
    console.error("Error fetching roles:", error)
    roles.value = [] 
  }
}

onMounted(getDataRol)

const handleSubmit = async() => {
  try {
    const response = await apiService.post("/users", user.value)
    console.log("API Response:", response)
    if (response && response.success) {
      alert("Usuario agregado exitosamente")
      handleCancel()
    } else {
      alert("Hubo un error al agregar el usuario")
    }
  } catch (error) {
    console.error("Error agregando usuario:", error)
    alert("Hubo un error al agregar el usuario")
  }

}

const handleCancel = () => {
  Object.keys(user.value).forEach((key) => (user.value[key] = ''))
  user.value.image = null
}
</script>

<template>
  <v-container>
    <v-card class="mx-auto pa-6" max-width="900" elevation="8">
      <v-card-title class="text-h4 text-center text-success mb-4">
        Gestión de usuarios
      </v-card-title>
      <v-card-subtitle class="text-h5 text-center mb-6">
        Agregar usuario
      </v-card-subtitle>

      <v-form @submit.prevent="handleSubmit">
        <!-- Image Upload -->
        <div class="text-center mb-6">
          <v-avatar size="120" color="grey lighten-2">
            <v-img v-if="user.image" :src="user.image" alt="User"></v-img>
            <v-icon v-else size="48" :icon="mdiUpload"></v-icon>
          </v-avatar>
          <v-file-input
            v-model="user.image"
            accept="image/*"
            label="Cargar imagen"
            prepend-icon=""
            @change="handleImageUpload"
            class="mt-2"
            hide-input
          ></v-file-input>
        </div>

        <v-row>
          <!-- Name -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="user.name"
              label="Nombre completo"
              outlined
              dense
            ></v-text-field>
          </v-col>

          <!-- Email -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="user.email"
              label="Correo electrónico"
              type="email"
              outlined
              dense
            ></v-text-field>
          </v-col>

          <!-- Phone -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="user.phone"
              label="Número de teléfono"
              outlined
              dense
              prefix="+57"
            ></v-text-field>
          </v-col>

          <!-- Document Type -->
          <v-col cols="12" md="6">
            <v-select
              v-model="user.typeDocument"
              :items="documentTypes"
              label="Tipo de documento"
              outlined
              dense
            ></v-select>
          </v-col>

          <!-- Document Number -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="user.numberDocument"
              label="Número de documento"
              outlined
              dense
            ></v-text-field>
          </v-col>

          <!-- Role -->
          <v-col cols="12" md="6">
            <v-select
              v-model="user.assignedRol"
              :items="roles"
              item-title="text"
              item-value="value"
              label="Asignar rol"
              outlined
              dense
            ></v-select>
          </v-col>

          <!-- Position -->
          <v-col cols="12" md="6">
            <v-select
              v-model="user.assignedPosition"
              :items="assignedPosition"
              label="Asignar cargo"
              outlined
              dense
            ></v-select>
          </v-col>

          <!-- Password -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="user.password"
              :append-icon="passwordVisibility.password ? mdiEyeOff : mdiEye"
              :type="passwordVisibility.password ? 'text' : 'password'"
              label="Contraseña"
              outlined
              dense
              @click:append="toggleVisibility('password')"
            ></v-text-field>
          </v-col>

          <!-- Confirm Password -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="user.password"
              :append-icon="passwordVisibility.password ? mdiEyeOff : mdiEye"
              :type="passwordVisibility.password ? 'text' : 'password'"
              label="Confirmar contraseña"
              outlined
              dense
              @click:append="toggleVisibility('password')"
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- Action Buttons -->
        <v-row class="mt-6">
          <v-col cols="12" sm="6">
            <v-btn
              color="error"
              block
              @click="handleCancel"
              elevation="2"
            >
              Cancelar
            </v-btn>
          </v-col>
          <v-col cols="12" sm="6">
            <v-btn
              color="success"
              block
              type="submit"
              elevation="2"
            >
              Registrar
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
  </v-container>
</template>

<style scoped>
.v-card {
  border-radius: 16px;
}
.text-success {
  color: #39B54A !important;
}
</style>