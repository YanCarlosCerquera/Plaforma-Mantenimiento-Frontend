<script setup>
import { ref, computed, onBeforeMount, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import Swal from "sweetalert2";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
import fondoImage2 from "../assets/image208.png";
import apiService from "../service/apiService";
import Footer from "../examples/PageLayout/Footer.vue";
const router = useRouter();
const store = useStore();
const body = document.getElementsByTagName("body")[0];

const maintenanceType = [
  { value: "Preventivo", label: "Preventivo" },
  { value: "Correctivo", label: "Correctivo" },
  { value: "Desconocido", label: "Desconocido" },
];

const formData = ref({
  requesterName: "",
  requesterPhone: "",
  serialNumber: "",
  trackingNumber: "",
  issueDescription: "",
  InventoryCode: "",
  maintenanceType: "",
  workOrderStatus: false,
});

const loading = ref(false);

const handleLoginClick = () => {
  router.push("/signin");
};

const handleSignup = () => {
  router.push("/signup");
};

const handleActivos = () => {
  router.push("/bienes")
};

const handleSolicitud = () => {
  router.push("/solicitud")
}


const handleSubmit = async (event) => {
  event.preventDefault();

  // Validación básica
  if (
    !formData.value.requesterName ||
    !formData.value.requesterPhone ||
    !formData.value.serialNumber
  ) {
    Swal.fire({
      icon: "warning",
      title: "Campos requeridos",
      text: "Por favor complete todos los campos requeridos",
    });
    return;
  }

  loading.value = true;

  // Mostrar alerta de carga
  Swal.fire({
    title: "Enviando solicitud...",
    text: "Por favor espere mientras procesamos su solicitud.",
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading(); // Muestra un spinner
    },
  });

  try {
    let { requesterPhone } = formData.value;

    // Agregar prefijo si no está presente
    if (!requesterPhone.startsWith("57")) {
      requesterPhone = `57${requesterPhone}`;
    }

    const data = {
      ...formData.value,
      requesterPhone,
      createdAt: new Date().toISOString(),
    };

    const response = await apiService.post("/application-maintenance", data);

    // Cerrar alerta de carga
    Swal.close();

    // Mostrar alerta de éxito
    Swal.fire({
      icon: "success",
      title: "Éxito",
      html: `Solicitud enviada exitosamente.<br>El número de radicado es: <b>${response.trackingNumber}</b>`,
    });

    // Resetea el formulario tras un envío exitoso
    formData.value = {
      requesterName: "",
      requesterPhone: "",
      serialNumber: "",
      issueDescription: "",
      InventoryCode: "",
      maintenanceType: "",
      workOrderStatus: false,
    };
  } catch (error) {
    console.error("Error al enviar la solicitud:", error);

    // Cerrar alerta de carga
    Swal.close();

    // Mostrar alerta de error
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error al procesar la solicitud. Por favor intente nuevamente.",
    });
  } finally {
    loading.value = false;
  }
};

onBeforeMount(() => {
  store.state.hideConfigButton = true;
  store.state.showNavbar = false;
  store.state.showSidenav = false;
  store.state.showFooter = false;
  body.classList.remove("bg-gray-100");
});

onBeforeUnmount(() => {
  store.state.hideConfigButton = false;
  store.state.showNavbar = true;
  store.state.showSidenav = true;
  store.state.showFooter = true;
  body.classList.add("bg-gray-100");
});

const backgroundStyle = computed(() => ({
  backgroundImage: `url(${fondoImage2})`,
  backgroundSize: "stretch",
  backgroundPosition: "top",
}));
</script>

<template>
  <main class="main-content mt-0">
    <div class="page-header align-items-start min-vh-50 pb-11 md:h-60" :style="backgroundStyle">
      <span class="mask bg-gradient-dark opacity-6 md:h-60"></span>
      <div class="container row">
        <div class="row justify-content-center mt-8 md:mt-16">
          <div class="col-lg-12 text-left mx-auto mt-8 md:mt-16">
            <h1 class="text-white mb-2 mt-1 md:mt-12 md:text-4xl lg:text-4xl sm:text-xs">
              Bienvenidos al sistema de gestión de inventarios de la regional Huila
            </h1>
          </div>
        </div>
      </div>
      <div class="container row d-flex justify-content-end flex-wrap">
        <div class="d-flex flex-column flex-md-row justify-content-end w-100">
          <ArgonButton color="success" class="my-2 md:my-4 mb-2 w-100 w-md-25 md:w-1/4 lg:w-1/5" @click="handleLoginClick">
            Ingresar
          </ArgonButton>
          <ArgonButton color="success" class="my-2 md:my-4 mb-2 w-100 w-md-25 md:w-1/4 lg:w-1/5 mx-md-3" @click="handleSignup">
            Registrarse
          </ArgonButton>
        </div>
      </div>
    </div>

    <div class="page-header align-items-start pt-5 border-radius-lg">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 text-center">
            <ArgonButton color="success" class="w-100 mb-3"  @click="handleActivos" >
              <i class="fa fa-database fa-4x position-static my-3 mr-10" aria-hidden="true"></i>
              <p class="text-3xl font-weight-bold">Consulta de bienes registrados</p>
            </ArgonButton>
          </div>
          <div class="col-md-6 text-center">
            <ArgonButton  color="success" class="w-100 mb-3" @click="handleSolicitud" >
              <i class="fa fa-search fa-4x position-static my-3 mr-10" aria-hidden="true"></i>
              <p class="text-3xl font-weight-bold">Consulta el estado de tu solicitud</p>
            </ArgonButton>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row justify-content-center">
        <div class="card p-3 border-radius-xl" style="max-width: 1300px;">
          <div class="card shadow-lg p-5 bg-white">
            <h1 class="text-left text-success text-4xl font-black mb-4">
              Realiza tu solicitud de mantenimiento
            </h1>
            <form class="row g-4" @submit.prevent="handleSubmit">
              <div class="form-group col-md-4">
                <p class="text-left text-dark mb-2 font-weight-bold">
                  Nombre del solicitante
                </p>
                <ArgonInput id="requesterName" type="text" v-model="formData.requesterName"
                  placeholder="Nombre del solicitante" aria-label="Correo" />
              </div>
              <div class="form-group col-md-4">
                <p class="text-left text-dark mb-2 font-weight-bold">
                  Número de teléfono
                </p>
                <ArgonInput id="requesterPhone" type="text" v-model="formData.requesterPhone"
                  placeholder="Número de teléfono" aria-label="Teléfono" />
              </div>
              <div class="form-group col-md-4">
                <p class="text-left text-dark mb-2 font-weight-bold">
                  Número de serie
                </p>
                <ArgonInput id="serialNumber" type="text" v-model="formData.serialNumber"
                  placeholder="Número de serie" aria-label="Serie" />
              </div>
              <div class="form-group col-md-12">
                <p class="text-left text-dark mb-2 font-weight-bold">
                  Descripción falla presentada
                </p>
                <textarea class="form-control" id="issueDescription" rows="4" v-model="formData.issueDescription"
                  placeholder="Descripción falla presentada"
                  style="border: 1px solid #d2d6da; border-radius: 0.5rem; padding: 0.5rem;"></textarea>
              </div>
              <div class="form-group col-md-6">
                <p class="text-left text-dark mb-2 font-weight-bold">
                  Código inventario
                </p>
                <ArgonInput id="InventoryCode" name="InventoryCode" type="text" v-model="formData.InventoryCode"
                  placeholder="Código de inventario" aria-label="Inventario" />
              </div>
              <div class="form-group col-md-6">
                <p class="text-left text-dark mb-2 font-weight-bold">
                  Tipo de mantenimiento
                </p>
                <ArgonSelect id="maintenanceType" placeholder="Selecciona el tipo de mantenimiento"
                  name="maintenanceType" v-model="formData.maintenanceType" size="lg" :options="maintenanceType" />
              </div>
              <div class="text-center mt-4">
                <ArgonButton type="submit" color="success" class="w-auto px-6">
                  Enviar solicitud
                </ArgonButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>
  <Footer />
</template>