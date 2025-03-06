<script setup>
import { ref, onMounted, computed } from "vue";
import Swal from "sweetalert2";
import { useStore } from "vuex";
import router from "../../router";
import Cookies from "js-cookie";
import AuthorsTable from "../components/AuthorsTable.vue";

// Definición de formateadores local (sin export)
const commonFormatters = {
  state(value) {
    if (value === true || value === false) {
      return `<span style="color: green;">Asignado</span>`;
    } else {
      return `<span style="color: red;">No asignada</span>`;
    }
  },
  // Otros formatters...
};

const store = useStore();
const TABLE_ID = "ordenes-trabajo";

const headers = ref([
  "Orden de Trabajo",
  "Tenico Ejecutor",
  "Fecha de asignación",
  "Fecha de Terminacion",
  "Prioridad",
  "Estado"
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
    formatter: commonFormatters.state,
  }
});

const rows = computed(() => store.getters["tables/getTableData"](TABLE_ID));

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

const fetchData = async () => {
  await store.dispatch("tables/fetchTableData", {
    tableId: TABLE_ID,
    endpoint: "/word-orden",
    formatters: {
      fechaInicio: formatDate,
      fechaFin: formatDate,
      state: formatWorkOrderStatus,
    },
  });
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
    const result = await store.dispatch("tables/deleteTableItem", {
      tableId: TABLE_ID,
      endpoint: "/word-orden",
      itemId: ordenId,
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

const handleEdit = (row) => {
  try {
    const ordenId = row._id?.toString() || row.toString();
    router.push(`/editar-orden`);
    Cookies.set("OrdenId", ordenId);
  } catch (error) {
    console.error("Error al navegar a la vista de edición:", error);
    Swal.fire({
      title: "Error al cargar la vista de edición",
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
  { class: "fas fa-edit", method: handleEdit },
  { class: "fas fa-search", method: handlConsultar },
]);

onMounted(async () => {
  await fetchData();
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
          @view="handleView"
          @delete="handleDelete"
          @Consultar="handlConsultar"
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
