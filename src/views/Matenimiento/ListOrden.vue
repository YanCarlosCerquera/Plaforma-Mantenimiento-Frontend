<script setup>
import { ref, onMounted, } from "vue";
import Swal from "sweetalert2";
import apiService from "../../service/apiservice";
import AuthorsTable from "../components/AuthorsTable.vue";
import router from "../../router";
import Cookies from "js-cookie";

const jwt_decode = require("jwt-decode");

const headers = ref([
  { text: "Orden de Trabajo", value: "radicado" },
  { text: "Tenico Ejecutor", value: "tecnicoId.name" },
  { text: "Fecha de asignación", value: "fechaInicio" },
  { text: "Fecha de Terminacion", value: "fechaFin" },
  { text: "Prioridad", value: "prioridad" },
  { text: "Estado", value: "state" }
]);

const fields = ref({
  radicado: {
    value: "radicado",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  tecnicoId: {
    value: "tecnicoId.name",
    class: "align-middle",
    textClass: "text-xs font-weight-bold mb-0",
  },
  fechaInicio: {
    value: "fechaInicio",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  fechaFin: {
    value: "fechaFin",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  prioridad: {
    value: "prioridad",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  state: {
    value: "state",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  }
});

const rows = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = 10; // Número de elementos por página

const formatDate = (dateString) => {
  if (!dateString) return "";
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return new Date(dateString)
    .toLocaleDateString("es-ES", options)
    .replace(".", "");
};

const formatWorkOrderStatus = (state) => {
  return state ? "Ejecutada" : "Sin ejecutar";
};

const normalizeText = (text) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const fetchData = async (page = 1) => {
  loading.value = true;
  try {
    const token = Cookies.get("authToken");
    if (!token) {
      console.error("No se encontró el token de autenticación");
      loading.value = false;
      return;
    }
    
    const decodedToken = jwt_decode.jwtDecode(token);
    const userId = decodedToken.sub;

    const menuCookie = Cookies.get("menu"); 
    const menu = menuCookie ? JSON.parse(menuCookie) : null; 
    const role = menu ? menu.role : null; 

    // Construir URL base con paginación
    let url = `/word-orden?limit=${itemsPerPage}&page=${page}`;

    // Añadir filtro por rol si es necesario
    if (role === 'instructor' || role === 'técnico') {
      const normalizedRole = normalizeText(role); 
      url += `&${normalizedRole}Id=${userId}`;
    }

    const response = await apiService.get(url, {});
    
    // Verificar si la respuesta tiene la estructura esperada con data y meta
    if (response && response.data && response.meta) {
      // Formato para respuestas con estructura {data, meta}
      rows.value = response.data.map((orden) => ({
        ...orden,
        fechaInicio: formatDate(orden.fechaInicio),
        fechaFin: formatDate(orden.fechaFin),
        state: formatWorkOrderStatus(orden.state),
      }));
      totalPages.value = response.meta.totalPages;
      currentPage.value = response.meta.page;
    } else {
      // Fallback para compatibilidad con versiones anteriores
      rows.value = response.map((orden) => ({
        ...orden,
        fechaInicio: formatDate(orden.fechaInicio),
        fechaFin: formatDate(orden.fechaFin),
        state: formatWorkOrderStatus(orden.state),
      }));
      // Si no hay meta data, calcular el total de páginas basado en la longitud del array
      totalPages.value = 1;
      currentPage.value = 1;
    }
  } catch (error) {
    console.error("Error fetching work orders:", error);
    Swal.fire({
      title: "Error al cargar las órdenes de trabajo",
      text: error.response?.data?.message || "Algo salió mal.",
      icon: "error",
      position: "bottom-right",
      toast: true,
      timer: 3000,
      background: "#dc3545",
      color: "white",
      iconColor: "white",
      showConfirmButton: false,
    });
    rows.value = [];
  } finally {
    loading.value = false;
  }
};

// Manejador para cambios de página
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchData(page);
};

const handleView = (row) => {
  try {
    const ordenId = row._id?.toString() || row.toString();
    router.push(`/eje`);
    Cookies.set("OrdenId", ordenId);
  } catch (error) {
    console.error("Error al navegar a la vista de detalles:", error);
    Swal.fire({
      title: "Error al cargar los detalles",
      text: error.message || "Algo salió mal.",
      icon: "error",
      position: "bottom-right",
      toast: true,
      timer: 3000,
      background: "#dc3545",
      color: "white",
      iconColor: "white",
      showConfirmButton: false,
    });
  }
};

const handleDelete = async (row) => {
  const result = await Swal.fire({
    title: "¿Estás seguro de que quieres eliminar esta orden de trabajo?",
    text: "Esta acción no puede deshacerse.",
    showCancelButton: true,
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    customClass: {
      title: "text-success",
      confirmButton: "btn-success",
      cancelButton: "btn-danger",
    },
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    const ordenId = row._id?.toString() || row.toString();
    await apiService.delete(`word-orden/${ordenId}`);
    
    Swal.fire({
      title: "Orden de trabajo eliminada correctamente",
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
    
    await fetchData(currentPage.value);
  } catch (error) {
    console.error("Error al eliminar la orden:", error);
    Swal.fire({
      title: "Error al eliminar la orden de trabajo",
      text: error.response?.data?.message || "Algo salió mal.",
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

const handlConsultar = (row) => {
  try {
    const ordenId = row._id?.toString() || row.toString();
    router.push(`/Informes`);
    Cookies.set("OrdenId", ordenId);
  } catch (error) {
    console.error("Error al navegar a la vista de informes:", error);
    Swal.fire({
      title: "Error al cargar la vista de informes",
      text: error.message || "Algo salió mal.",
      icon: "error",
      position: "bottom-right",
      toast: true,
      timer: 3000,
      background: "#dc3545",
      color: "white",
      iconColor: "white",
      showConfirmButton: false,
    });
  }
};

const icons = ref([
  { class: "fas fa-check", method: handleView },
  { class: "fas fa-trash", method: handleDelete },
  { class: "fas fa-search", method: handlConsultar },
]);

onMounted(async () => {
  await fetchData(1);
});
</script>

<template>
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-12">
        <AuthorsTable
          title="Ordenes de Trabajo"
          :headers="headers"
          :rows="rows"
          :fields="fields"
          :icons="icons"
          :loading="loading"
          @page-change="handlePageChange"
          :paginationData="{
            totalPages: totalPages,
            currentPage: currentPage,
            isServerPaginated: true
          }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.v-card {
  color: rgba(0, 0, 0, 0.87);
}
.v-card-title {
  color: rgba(0, 0, 0, 0.87);
}
.v-card-text {
  color: rgba(0, 0, 0, 0.6);
}
</style>