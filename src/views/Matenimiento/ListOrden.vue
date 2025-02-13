<script setup>
import { ref, onMounted, computed } from "vue";
import Swal from "sweetalert2";
import Table from "../components/Table.vue";
import { useStore } from 'vuex';
import router from "../../router";

const store = useStore();
const TABLE_ID = 'ordenes-trabajo';

const headers = ref([
  "Orden de Trabajo",
  "Tenico Ejecutor",
  "Fecha de asignación",
  "Fecha de Terminacion",
  "Prioridad",
  "Estado"
]);

const icons = ref({
  firstIcon: "fas fa-check",
  secondIcon: "fas fa-trash",
});

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

const rows = computed(() => store.getters['tables/getTableData'](TABLE_ID));

const formatDate = (dateString) => {
  if (!dateString) return "";
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return new Date(dateString)
    .toLocaleDateString("es-ES", options)
    .replace(".", "");
};

const formatWorkOrderStatus = (status) => {
  return status === false ? "Sin Ejecutar" : "Ejecutado";
};

const fetchData = async () => {
  await store.dispatch('tables/fetchTableData', {
    tableId: TABLE_ID,
    endpoint: "/word-orden",
    formatters: {
      fechaInicio: formatDate,
      fechaFin: formatDate,
      state: formatWorkOrderStatus
    }
  });
};

const handleView = (row) => {
  try {
    const ordenId = row._id?.toString() || row.toString();
    localStorage.setItem('OrdenId', ordenId);
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
    const result = await store.dispatch('tables/deleteTableItem', {
      tableId: TABLE_ID,
      endpoint: '/word-orden',
      itemId: ordenId
    });

    if (result.success) {
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
      });
    } else {
      throw new Error(result.error);
    }
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
          @view="handleView"
          @delete="handleDelete"
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