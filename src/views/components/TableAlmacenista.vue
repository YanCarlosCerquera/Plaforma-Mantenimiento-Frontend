<script setup>
import Swal from "sweetalert2";
import { onMounted, ref, computed } from "vue";
import router from "../../router";
import apiService from "../../service/apiService";
import AuthorsTable from "../components/AuthorsTable.vue";
import Cookies from "js-cookie";
import jsPDF from "jspdf";

const loading = ref(false);
const assets = ref([]);

const headers = ref([
  "Código inventario",
  "Serial",
  "Nombre",
  "Ubicación",
  "Fecha adquisición",
  "Último mantenimiento",
  "Categoría",
  "Estado",
]);

const fields = ref({
  code: {
    value: "inventoryCode",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  serialNumber: {
    value: "serialNumber",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  name: {
    value: "name",
    class: "align-middle",
    textClass: "text-xs font-weight-bold mb-0",
  },
  location: {
    value: "location",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  acquisitionDate: {
    value: "acquisitionDate",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  lastReportDate: {
    value: "lastReportDate",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  category: {
    value: "categoryId.name",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  status: {
    value: "status",
    class: "align-middle",
    textClass: (row) =>
      row.status === "Bueno"
        ? "text-green-600 border border-green-400 bg-green-100 px-2 py-1 rounded-md font-bold"
        : "text-red-600 border border-red-400 bg-red-100 px-2 py-1 rounded-md font-bold",
  }
});

const formatDate = (dateString) => {
  if (!dateString) return "No hay mantenimiento";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).replace(".", ""); 
};

const formattedAssets = computed(() =>
  assets.value.map((item) => ({
    ...item,
    acquisitionDate: formatDate(item.acquisitionDate),
    lastReportDate: formatDate(item.lastReportDate),
    status: item.status ? "Bueno" : "Dañado",
  }))
);

const fetchData = async () => {
  try {
    loading.value = true;
    const data = await apiService.get("/assets");
    assets.value = data;
  } catch (error) {
    console.error("Error fetching assets:", error);
    showAlert({
      title: "Error al cargar los datos",
      text: "Hubo un problema al obtener la lista de equipos",
      icon: "error",
    });
  } finally {
    loading.value = false;
  }
};

const showAlert = ({ title, text, icon }) => {
  Swal.fire({
    title,
    text,
    icon,
    position: "bottom-right",
    toast: true,
    timer: 3000,
    background: icon === "success" ? "#28a745" : "#dc3545",
    color: "white",
    iconColor: "white",
    showConfirmButton: false,
  });
};

const handleView = (row) => {
  try {
    Cookies.set('editAssetId', row._id, { expires: 1/24 });
    router.push("/assets/detail");
  } catch (error) {
    showAlert({
      title: "Error",
      text: "No se pudo navegar a la vista de detalles del equipo",
      icon: "error"
    });
  }
};

const handleEdit = (row) => {
  try {
    Cookies.set('editAssetId', row._id, { expires: 1/24 });
    router.push("/assets/edit");
  } catch (error) {
    showAlert({
      title: "Error",
      text: "No se pudo iniciar la edición del equipo",
      icon: "error"
    });
  }
};

const handleDelete = async (row) => {
  const result = await Swal.fire({
    title: "¿Estás seguro de que quieres eliminar este equipo?",
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

  try {
    await apiService.delete(`/assets/${row._id}`);
    await fetchData();
    showAlert({
      title: "Equipo eliminado correctamente",
      text: "El equipo ha sido eliminado de la base de datos",
      icon: "success",
    });
  } catch (error) {
    showAlert({
      title: "Error al eliminar el equipo",
      text: "Algo salió mal al intentar eliminar el equipo",
      icon: "error",
    });
  }
};

const handleInfo = async (row) => {
  try {
    const response = await apiService.get(`/assets/${row._id}`);
    const assetData = response;
    const pdfData = {
      name: assetData.name,
      brand: assetData.brand,
      model: assetData.modelo,
      serialNumber: assetData.serialNumber,
      location: assetData.location,
      acquisitionDate: assetData.acquisitionDate,
      category: assetData.categoryId.name,
      status: assetData.status,
    };

    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text("Información del Equipo", 15, 15);

    pdf.setFontSize(12);
    Object.keys(pdfData).forEach((key, index) => {
      pdf.text(`${key}: ${pdfData[key]}`, 15, 20 + (index * 5));
    });

    const pdfBlob = new Blob([pdf.output("blob")], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(pdfBlob);
    link.setAttribute("download", `${pdfData.name}.pdf`);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
      document.body.removeChild(link);
    }, 0);
  } catch (error) {
    console.log(error)
    showAlert({
      title: "Error al generar el PDF",
      text: "Algo salió mal al intentar generar el PDF",
      icon: "error",
    });
  }
};

const icons = ref([
    { class: "fa-solid fa-download", method: handleInfo },
    { class: "fas fa-edit", method: handleEdit },
    { class: "fas fa-eye", method: handleView },
    { class: "fas fa-trash", method: handleDelete },
]);

onMounted(() => {
  fetchData();
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
          :headers="headers"
          :rows="formattedAssets"
          :fields="fields"
          :icons="icons"
          :searchOption="false"
          :exportOption="false"
        >
            <template #add-button>
                <h2 class="text-succes">Bienes</h2>
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