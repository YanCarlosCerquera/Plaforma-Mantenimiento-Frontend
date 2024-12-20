<script setup>
import { ref } from "vue";

const user = ref({
  name: "",
  email: "",
  phone: "",
  role: "",
  position: "",
  typeDocument: "",
  numberDocument: "",
  password: "",
  confirmPassword: "",
});

const roles = ref(["Administrador", "Instructor", "Estudiante"]);
const positions = ref(["Coordinador", "Docente", "Asistente"]);
const documentTypes = ref(["Cédula", "Pasaporte", "Tarjeta de identidad"]);

const passwordVisibility = ref({
  password: false,
  confirmPassword: false,
});

const toggleVisibility = (field) => {
  passwordVisibility.value[field] = !passwordVisibility.value[field];
};

const handleImageUpload = (event) => {
  console.log("Image uploaded:", event.target.files[0]);
};

const handleSubmit = () => {
  console.log("User data submitted:", user.value);
};

const handleCancel = () => {
  console.log("Form canceled");
  Object.keys(user.value).forEach((key) => (user.value[key] = ""));
};
</script>

<template>
    <div class="container mt-5">
      <div class="card p-5 shadow" style="border-radius: 16px; max-width: 900px; margin: auto;">
        <h2 class="text-center mb-4 text-success">Gestión de usuarios</h2>
        <h4 class="text-center text-dark">Agregar usuario</h4>
  
        <!-- Imagen de carga -->
        <div class="text-center my-4">
          <label for="imageUpload" class="d-block mb-3">
            <img
              src="https://via.placeholder.com/120"
              alt="Upload"
              class="rounded-circle border"
              style="width: 120px; height: 120px; cursor: pointer;"
            />
          </label>
          <input
            type="file"
            id="imageUpload"
            @change="handleImageUpload"
            style="display: none;"
          />
          <p class="text-secondary">Cargar imagen</p>
        </div>
  
        <!-- Formulario -->
        <div class="row g-4">
          <!-- Nombre Completo -->
          <div class="col-md-6">
            <label for="name" class="form-label">Nombre completo</label>
            <input
              v-model="user.name"
              type="text"
              id="name"
              class="form-control form-control-lg"
              placeholder="Ingrese el nombre completo"
            />
          </div>
  
          <!-- Correo Electrónico -->
          <div class="col-md-6">
            <label for="email" class="form-label">Correo electrónico</label>
            <input
              v-model="user.email"
              type="email"
              id="email"
              class="form-control form-control-lg"
              placeholder="Ingrese el correo electrónico"
            />
          </div>
  
          <!-- Número de Teléfono -->
          <div class="col-md-6">
            <label for="phone" class="form-label">Número de teléfono</label>
            <div class="input-group input-group-lg">
              <span class="input-group-text">+57</span>
              <input
                v-model="user.phone"
                type="text"
                id="phone"
                class="form-control"
                placeholder="Ingrese el número de teléfono"
              />
            </div>
          </div>
  
          <!-- Tipo de Documento -->
          <div class="col-md-6">
            <label for="typeDocument" class="form-label">Tipo de documento</label>
            <select
              v-model="user.typeDocument"
              id="typeDocument"
              class="form-select form-select-lg"
            >
              <option disabled value="">Seleccione un tipo de documento</option>
              <option v-for="type in documentTypes" :key="type">{{ type }}</option>
            </select>
          </div>
  
          <!-- Número de Documento -->
          <div class="col-md-6">
            <label for="numberDocument" class="form-label">Número de documento</label>
            <input
              v-model="user.numberDocument"
              type="text"
              id="numberDocument"
              class="form-control form-control-lg"
              placeholder="Ingrese su número de documento"
            />
          </div>
  
          <!-- Asignar Rol -->
          <div class="col-md-6">
            <label for="role" class="form-label">Asignar rol</label>
            <select v-model="user.role" id="role" class="form-select form-select-lg">
              <option disabled value="">Asigne un rol al usuario</option>
              <option v-for="role in roles" :key="role">{{ role }}</option>
            </select>
          </div>
  
          <!-- Asignar Cargo -->
          <div class="col-md-6">
            <label for="position" class="form-label">Asignar cargo</label>
            <select v-model="user.position" id="position" class="form-select form-select-lg">
              <option disabled value="">Asigne un cargo al usuario</option>
              <option v-for="position in positions" :key="position">
                {{ position }}
              </option>
            </select>
          </div>
  
          <!-- Contraseña -->
          <div class="col-md-6 position-relative">
            <label for="password" class="form-label">Contraseña</label>
            <div class="input-group input-group-lg">
              <input
                v-model="user.password"
                :type="passwordVisibility.password ? 'text' : 'password'"
                id="password"
                class="form-control"
                placeholder="Ingrese la contraseña"
              />
              <span class="input-group-text">
                <i
                  :class="passwordVisibility.password ? 'bi bi-eye-slash' : 'bi bi-eye'"
                  @click="toggleVisibility('password')"
                  style="cursor: pointer;"
                ></i>
              </span>
            </div>
          </div>
  
          <!-- Confirmar Contraseña -->
          <div class="col-md-6 position-relative">
            <label for="confirmPassword" class="form-label">Confirmar contraseña</label>
            <div class="input-group input-group-lg">
              <input
                v-model="user.confirmPassword"
                :type="passwordVisibility.confirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                class="form-control"
                placeholder="Confirme la contraseña"
              />
              <span class="input-group-text">
                <i
                  :class="passwordVisibility.confirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
                  @click="toggleVisibility('confirmPassword')"
                  style="cursor: pointer;"
                ></i>
              </span>
            </div>
          </div>
        </div>
  
        <!-- Botones -->
        <div class="d-flex justify-content-between mt-5">
          <button
            @click="handleCancel"
            class="btn btn-danger btn-lg px-5"
          >
            Cancelar
          </button>
          <button
            @click="handleSubmit"
            class="btn btn-success btn-lg px-5"
          >
            Registrar
          </button>
        </div>
      </div>
    </div>
  </template>
  
<style>
body {
  background-color: #f8f9fa;
}

.card {
  border: none;
}
</style>  