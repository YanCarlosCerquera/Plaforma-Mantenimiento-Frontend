<script setup>
import { ref, onMounted } from "vue";
import apiService from "../service/apiService";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import defaultImage from "@/assets/img/logos/image_upload.svg";

const token = Cookies.get('authToken');

const user = ref({
  name: "",
  email: "",
  phone: "",
  assignedRol: "",
  assignedPosition: "",
  typeDocument: "",
  numberDocument: "",
  password: "",
  photoUrl: defaultImage, // Inicializar con la imagen por defecto
});

const roles = ref([]);
const documentTypes = [
  { value: "", label: "Selecciona tu tipo de documento" },
  { value: "Cédula de Ciudadanía", label: "Cédula de Ciudadanía" },
  { value: "Cédula de Extranjería", label: "Cédula de Extranjería" },
  { value: "Tarjeta de Identidad", label: "Tarjeta de Identidad" },
];
const assignedPosition = [
  { value: "", label: "Selecciona cargo desempeñado" },
  { value: "Planta", label: "Planta" },
  { value: "Contratista", label: "Contratista" },
];

// Manejar la subida de imágenes
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const maxWidth = 800;
        const maxHeight = 800;

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        const compressedImage = canvas.toDataURL("image/jpeg", 0.8);

        user.value.photoUrl = compressedImage; // Actualizar la URL de la imagen
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }
};

// Obtener los roles desde la API
const getDataRol = async () => {
  try {
    const response = await apiService.get("/rol", {}, { Authorization: `Bearer ${token}`, });
    if (response && Array.isArray(response)) {
      roles.value = response.map((assignedRol) => ({
        value: assignedRol._id,
        label: assignedRol.name,
      }));
      if (roles.value.length > 0) {
        user.value.assignedRol = roles.value[0].value;
      }
    }
  } catch (error) {
    console.error("Error fetching roles:", error);
    roles.value = [];
  }
};

onMounted(getDataRol);

// Manejar el envío del formulario
const handleSubmit = async () => {
  try {
    const userData = { ...user.value };

    // Si la imagen es la misma que la imagen por defecto, enviar photoUrl como vacía
    if (userData.photoUrl === defaultImage) {
      userData.photoUrl = "";
    }

    await apiService.post("/users", { ...userData, state: true }, { Authorization: `Bearer ${token}`, });

    Swal.fire({
      title: "Usuario agregado exitosamente",
      icon: "success",
      position: "bottom-right",
      toast: true,
      timer: 3000,
      background: "#28a745",
      color: "white",
      iconColor: "white",
      showConfirmButton: false,
      customClass: {
        title: "swal-title-white",
      },
    });

    handleCancel(); // Restablecer el formulario
  } catch (error) {
    Swal.fire({
      title: "Error agregando usuario:",
      text:
        error ||
        "Hubo un error al agregar el usuario",
      icon: "error",
      position: "bottom-right",
      toast: true,
      timer: 3000,
      background: "#dc3545",
      color: "white",
      iconColor: "white",
      showConfirmButton: false,
      customClass: {
        title: "swal-title-white",
      },
    });
  }
};

// Restablecer el formulario al cancelar
const handleCancel = () => {
  Object.keys(user.value).forEach((key) => (user.value[key] = ""));
  user.value.photoUrl = defaultImage; // Restablecer a la imagen por defecto
};
</script>

<template>
  <main>
    <div class="card shadow-lg mt-2 mx-2 mx-md-8">
      <div class="card-title d-flex align-items-center justify-content-center" style="margin: 1rem">
        <h3 class="mb-1 text-h4 text-success">Agregar usuario</h3>
      </div>
      <div class="card-body p-3">
        <form @submit.prevent="handleSubmit">
          <div class="grid-container">
            <!-- Columna izquierda -->
            <div class="grid-item image-container">
              <div class="text-center">
                <div class="image-upload" style="position: relative; display: inline-block">
                  <img
                    :src="user.photoUrl"
                    alt="Imagen de usuario"
                    class="rounded-circle"
                    style="width: 150px; height: 150px; object-fit: cover; border: 2px solid #ddd;"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleImageUpload"
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;"
                  />
                </div>
                <h4 class="mt-2">Cargar imagen</h4>
              </div>
            </div>
            <div class="grid-item">
              <label for="assignedRol" class="form-control-label">Asignar rol</label>
              <argon-select id="assignedRol" :options="roles" v-model="user.assignedRol" />
            </div>
            <div class="grid-item">
              <label for="assignedPosition" class="form-control-label">Asignar cargo</label>
              <argon-select id="assignedPosition" :options="assignedPosition" v-model="user.assignedPosition" />
            </div>
            <div class="grid-item">
              <label for="password" class="form-control-label">Contraseña</label>
              <argon-input id="password" type="password" v-model="user.password" />
            </div>
            <!-- Columna derecha -->
            <div class="grid-item">
              <label for="name" class="form-control-label">Nombre completo</label>
              <argon-input id="name" type="text" v-model="user.name" />
            </div>
            <div class="grid-item">
              <label for="email" class="form-control-label">Correo electrónico</label>
              <argon-input id="email" type="email" v-model="user.email" />
            </div>
            <div class="grid-item">
              <label for="phone" class="form-control-label">Número de teléfono</label>
              <argon-input id="phone" prefix="+57" type="number" v-model="user.phone" />
            </div>
            <div class="grid-item">
              <label for="typeDocument" class="form-control-label">Tipo de documento</label>
              <argon-select id="typeDocument" :options="documentTypes" v-model="user.typeDocument" />
            </div>
            <div class="grid-item">
              <label for="numberDocument" class="form-control-label">Número de documento</label>
              <argon-input id="numberDocument" type="number" v-model="user.numberDocument" />
            </div>
            <div class="grid-item">
              <label for="confirmPassword" class="form-control-label">Confirmar contraseña</label>
              <argon-input id="confirmPassword" type="password" v-model="user.password" />
            </div>
          </div>
          <!-- Botones -->
          <div class="d-flex flex-column flex-md-row justify-content-center mt-4 gap-3">
            <button
              class="btn btn-danger w-100 w-md-auto"
              type="button"
              style="padding: 15px 30px; font-size: 18px"
              @click="handleCancel"
            >
              Cancelar
            </button>
            <button
              class="btn btn-success w-100 w-md-auto"
              style="padding: 15px 30px; font-size: 18px"
              type="submit"
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(6, auto);
  gap: 1rem;
}

.grid-item {
  display: flex;
  flex-direction: column;
}

.image-container {
  grid-row: span 3;
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
  }

  .image-container {
    grid-row: span 1;
  }
}

.v-card {
  border-radius: 16px;
}

.text-success {
  color: #39b54a !important;
}

.image-upload img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border: 2px solid #ddd;
}

@media (max-width: 768px) {
  .card {
    margin-left: 1rem !important;
    margin-right: 1rem !important;
  }

  .image-upload img {
    width: 100px !important;
    height: 100px !important;
  }

  .btn {
    width: 100% !important;
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 576px) {
  .btn {
    font-size: 16px !important;
    padding: 10px 20px !important;
  }
}
</style>