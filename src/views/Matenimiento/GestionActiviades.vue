<script setup>
import Swal from "sweetalert2";
import { onMounted, ref } from "vue";
import router from "../../router";
import AuthorsTable from "../components/AuthorsTable.vue";
import apiService from "../../service/apiservice";
import { commonFormatters } from "../../store/modules/tables";

const loading = ref(false);
const activities = ref([]);

const headers = ref([
  "Radicado de Solicitud",
  "Solicitante",
  "Fecha de Solicitud",
  "Codigo Inventario",
  "Serial",
  "Estado OT",
]);

const fields = ref({
  trackingNumber: {
    value: "trackingNumber",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  requesterName: {
    value: "requesterName",
    class: "align-middle",
    textClass: "text-xs font-weight-bold mb-0",
  },
  createdAt: {
    value: "createdAt",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
    formatter: commonFormatters.date,
  },
  inventoryCode: {
    value: "InventoryCode",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  serialNumber: {
    value: "serialNumber",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  workOrderStatus: {
    value: "workOrderStatus",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
    formatter: commonFormatters.workOrderStatus,
  },
});

const fetchData = async () => {
  try {
    loading.value = true;
    const data = await apiService.get("/application-maintenance");
    activities.value = data;
  } catch (error) {
    console.error("Error fetching data:", error);
    Swal.fire({
      title: "Error al cargar los datos",
      text: "Hubo un problema al obtener las actividades",
      icon: "error",
      position: "bottom-right",
      toast: true,
      timer: 3000,
      background: "#dc3545",
      color: "white",
      iconColor: "white",
      showConfirmButton: false,
    });
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (row) => {
  const result = await Swal.fire({
    title: "¿Estás seguro de que quieres eliminar esta solicitud?",
    text: "Esta acción no puede deshacerse.",
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

  if (!result.isConfirmed) return;

  try {
    await apiService.delete(`/application-maintenance/${row._id}`);
    await fetchData();
    Swal.fire({
      title: "Solicitud eliminada correctamente",
      icon: "success",
      position: "bottom-right",
      toast: true,
      timer: 3000,
      background: "#28a745",
      color: "white",
      iconColor: "white",
      showConfirmButton: false,
    });
  } catch (error) {
    Swal.fire({
      title: "Error al eliminar la Solicitud",
      text: "Algo salió mal al intentar eliminar la solicitud.",
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

const handleView = (row) => {
  localStorage.setItem("selectedRequestId", row._id);
  router.push("/mantenimientos/detalles");
};

const icons = ref([
  { class: "fas fa-trash", method: handleDelete },
  { class: "fas fa-eye", method: handleView },
]);

onMounted(() => {
  fetchData();
});

// Recargar datos cuando se regresa a la página
router.beforeEach((to, from, next) => {
  if (
    to.path === "/maintenance/requests" &&
    from.path.startsWith("/maintenance/requests/")
  ) {
    fetchData();
  }
  next();
});
</script>

<template>
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-12">
        <div v-if="loading" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
        <AuthorsTable
          title="Solicitudes de mantenimiento generales"
          :headers="headers"
          :rows="activities"
          :fields="fields"
          :icons="icons"
        >
          <template #cell-workOrderStatus="{ value }">
            <span v-html="value"></span>
          </template>
        </AuthorsTable>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table td,
.table th {
  white-space: nowrap;
}
</style>
