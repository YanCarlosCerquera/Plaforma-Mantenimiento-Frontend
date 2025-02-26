<script setup>
import Swal from "sweetalert2";
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";
import router from "../../router";
import { commonFormatters } from "../../store/modules/tables";
import Table from "../components/Table.vue";

const store = useStore();
const TABLE_ID = "maintenance-activities";

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
  },
});

const rows = computed(() => store.getters["tables/getTableData"](TABLE_ID));
const loading = computed(() =>
  store.getters["tables/isTableLoading"](TABLE_ID)
);

const fetchData = async () => {
  await store.dispatch("tables/fetchTableData", {
    tableId: TABLE_ID,
    endpoint: "/application-maintenance",
    formatters: {
      createdAt: commonFormatters.date,
      workOrderStatus: commonFormatters.workOrderStatus,
    },
  });
};

const handleView = (row) => {
  localStorage.setItem("selectedRequestId", row._id);
  router.push("/mantenimientos/detalles");
};

const handleDelete = async (row) => {
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

  if (!result.isConfirmed) return;

  const { success } = await store.dispatch("tables/deleteTableItem", {
    endpoint: "application-maintenance",
    itemId: row,
    refreshConfig: {
      tableId: TABLE_ID,
      endpoint: "/application-maintenance",
      formatters: {
        createdAt: commonFormatters.date,
        workOrderStatus: commonFormatters.workOrderStatus,
      },
    },
  });
  fetchData();

  if (success) {
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
  } else {
    Swal.fire({
      title: "Error al eliminar la Solicitud",
      text: "Algo salió mal al intentar eliminar la solicitud.",
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

onMounted(() => {
  fetchData();
});

// Recargar datos cuando se regresa a la página
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
        <Table
          v-else
          :tableId="TABLE_ID"
          title="Gestión de Actividades"
          :headers="headers"
          :rows="rows"
          :fields="fields"
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
.table td,
.table th {
  white-space: nowrap;
}
</style>
