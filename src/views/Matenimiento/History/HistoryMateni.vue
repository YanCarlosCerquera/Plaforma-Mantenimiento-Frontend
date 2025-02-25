<script setup>
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";
import apiService from "../../../service/apiService";
import router from "../../../router";
import Table from "../../components/Table.vue";

const headers = ref([
  "Tipo de mantenimiento",
  "Orden de Trabajo",
  "Trabajo Realizado",
  "Horas",
  "Costo",
  "Respuestas",
  "Observaciones",
]);

const icons = ref({
  firstIcon: "fas fa-check",
  secondIcon: "fas fa-trash",
});

const fields = ref({
  maintenanceType: {
    value: "orderId.solicitud.solicitudId.maintenanceType",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  radicado: {
    value: "orderId.radicado",
    class: "align-middle",
    textClass: "text-xs font-weight-bold mb-0",
  },
  workDone: {
    value: "workDone",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  hours: {
    value: "hours",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  costs: {
    value: "costs",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
    format: (value) => `$${parseFloat(value).toFixed(2)}`
  },
  responses: {
    value: "responses",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  observation: {
    value: "observation",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
 
});

const rows = ref([]);
const dialog = ref(false);
const editedItem = ref({});

const fetchData = async () => {
  const serialNumber = localStorage.getItem('serialNumber');

  try {
    if (!serialNumber) {
      console.error('No hay número de serie disponible');
      return;
    }
    const response = await apiService.get(`/work-report/maintenanceHistory/${serialNumber}`);
    rows.value = (response.data || response).map(item => ({
      ...item,
      costs: parseFloat(item.costs || 0).toFixed(2),
      hours: parseInt(item.hours || 0),
      workDone: item.workDone || 'No especificado',
      observation: item.observation || 'Sin observaciones',
      responses: item.responses || 'Sin respuestas'
    }));
  } catch (error) {
    console.error("Error fetching activities:", error);
    Swal.fire({
      title: "Error al cargar las actividades",
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
  }
};

const handleEdit = (row) => {
  editedItem.value = { ...row };
  dialog.value = true;
};

const handleView = (_id) => {
  try {
    // Guardamos el ID en localStorage
    localStorage.setItem('OrdenId', _id);

    // Navegamos a la vista de detalles
    router.push("/informes");
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

const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: "¿Estás seguro de que quieres eliminar esta solicitud?",
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
    await apiService.delete(`application-maintenance/${id}`);
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
    await fetchData();
  } catch (error) {
    Swal.fire({
      title: "Error al eliminar la Solicitud",
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
  }
};

onMounted(async () => {
  await fetchData();
});
</script>

<template>
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-12">
        <Table
          title="Ordenes de Trabajo"
          :headers="headers"
          :rows="rows"
          :fields="fields"
          :icons="icons"
          @edit="handleEdit"
          @delete="handleDelete"
          @view="handleView"
        >
        <template #cell-workOrderStatus="{ value }">
            <span v-html="value"></span>
          </template>
        </Table>
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