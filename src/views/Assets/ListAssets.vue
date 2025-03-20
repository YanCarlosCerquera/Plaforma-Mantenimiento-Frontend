<script setup>
import Swal from "sweetalert2";
import { onMounted, ref, } from "vue";
import router from "../../router";
import apiService from "../../service/apiservice";
import AuthorsTable from "../components/AuthorsTable.vue";
import Cookies from "js-cookie";
import jsPDF from "jspdf";

const loading = ref(false);
const assets = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = 10; // Always 10 as requested

const headers = ref([
  "Código",
  "Nombre",
  "Marca",
  "Modelo",
  "Serial",
  "Estado",
  "Ubicación",
]);

const fields = ref({
  code: {
    value: "inventoryCode",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  name: {
    value: "name",
    class: "align-middle",
    textClass: "text-xs font-weight-bold mb-0",
  },
  brand: {
    value: "brand",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  model: {
    value: "modelo",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  serialNumber: {
    value: "serialNumber",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  status: {
    value: "status",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
    formatter: (value) => {
      return value ? '<span class="text-success">Activo</span>' : '<span class="text-danger">Inactivo</span>';
    }
  },
  location: {
    value: "location",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
});

const fetchData = async (page = 1) => {
  try {
    loading.value = true;
    const response = await apiService.get(`/assets?limit=${itemsPerPage}&page=${page}`);
    
    // Check if the response has the expected structure with data and meta
    if (response && response.data && response.meta) {
      assets.value = response.data;
      totalPages.value = response.meta.totalPages;
      currentPage.value = response.meta.page;
    } else {
      // Fallback for backward compatibility
      assets.value = response;
      // If no meta data, assume single page
      totalPages.value = 1;
      currentPage.value = 1;
    }
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

const handlePageChange = (page) => {
  currentPage.value = page;
  fetchData(page);
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
    // Guardar ID en cookie con expiración de 1 hora
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
    await fetchData(currentPage.value);
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
    showAlert({
      title: "Error al generar el PDF",
      text: "Algo salió mal al intentar generar el PDF",
      icon: "error",
    });
  }
};

const icons = ref([
  { class: "fas fa-eye", method: handleView },
  { class: "fas fa-edit", method: handleEdit },
  { class: "fas fa-trash", method: handleDelete },
  { class: "fas fa-info-circle", method: handleInfo },
]);

onMounted(() => {
  fetchData(1);
});
</script>

<template>
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-12">
        <AuthorsTable
          title="Maquinas y Equipos"
          :headers="headers"
          :rows="assets"
          :fields="fields"
          :icons="icons"
          :loading="loading"
          @page-change="handlePageChange"
          :paginationData="{
            totalPages: totalPages,
            currentPage: currentPage,
            isServerPaginated: true
          }"
        >
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