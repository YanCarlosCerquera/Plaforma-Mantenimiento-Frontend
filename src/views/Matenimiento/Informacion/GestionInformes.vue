<template>
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-12">
        <div v-if="isLoading" class="text-center my-4">
          <i
            class="fa-solid fa-spinner fa-spin-pulse fa-spin-reverse text-primary text-3xl"
          ></i>
          <p class="mt-2 text-lg font-semibold">Cargando datos...</p>
        </div>
        <div v-else>
          <AuthorsTable
            title="Gestión de Informes"
            :headers="headers"
            :rows="rows"
            :fields="fields"
            :icons="icons"
            @edit="handleEdit"
            @delete="handleDelete"
            @check="handleDownloadPDF"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import apiService from "../../../service/apiservice";
import AuthorsTable from "../../components/AuthorsTable.vue";
import { useRouter } from "vue-router";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

export default {
  components: {
    AuthorsTable,
  },
  setup() {
    // Estados
    const isLoading = ref(false);
    const rows = ref([]);
    const router = useRouter();

    const headers = ref([
      "Informe",
      "Código Inventario",
      "Horas",
      "Costos",
      "Trabajo Realizado",
      "Ejecutado Por",
    ]);

    const fields = ref({
      Informe: {
        value: "Informe",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
      },
      CodigoInventario: {
        value: "CodigoInventario",
        class: "align-middle",
        textClass: "text-xs font-weight-bold mb-0",
      },
      Horas: {
        value: "Horas",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
      },
      Costos: {
        value: "Costos",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
      },
      TrabajoRealizado: {
        value: "TrabajoRealizado",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
      },
      EjecutadoPor: {
        value: "EjecutadoPor",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
      },
    });

    const fetchData = async () => {
      isLoading.value = true;
      try {
        const response = await apiService.get("/work-report/Informes");
        
        rows.value = response.map((item) => ({
          ...item,
          id: item.Id
        }));
        
        console.log("Datos cargados:", rows.value);
      } catch (error) {
        console.error("Error al obtener informes:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los informes',
          confirmButtonColor: '#39a900'
        });
      } finally {
        isLoading.value = false;
      }
    };

    const handleDownloadPDF = async (item) => {
  let reportId;
  
  if (typeof item === 'string') {
    reportId = item;
  } else if (item && typeof item === 'object') {
    reportId = item.Id || item.id;
  } else {
    console.error("Formato de ID no válido:", item);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'ID de informe no válido',
      confirmButtonColor: '#39a900'
    });
    return;
  }
  
  if (!reportId) {
    console.error("ID de informe no encontrado");
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'ID de informe no encontrado',
      confirmButtonColor: '#39a900'
    });
    return;
  }
  
  try {
    // Mostrar indicador de carga
    Swal.fire({
      title: 'Generando PDF',
      html: 'Por favor espere...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    // Opción 1: Descargar el PDF como blob
    try {
      const blob = await apiService.getBlob(`/work-report/pdf/${reportId}`);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `informe-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      Swal.fire({
        icon: 'success',
        title: 'PDF Generado',
        text: 'El informe se ha descargado correctamente',
        confirmButtonColor: '#39a900'
      });
    } catch (blobError) {
      console.error("Error al descargar como blob, intentando abrir en nueva pestaña:", blobError);
      
      // Opción 2: Si falla la descarga como blob, intentar abrir en nueva pestaña
      const pdfUrl = `${apiService.getBaseUrl()}/work-report/pdf/${reportId}`;
      window.open(pdfUrl, '_blank');
      
      Swal.close();
    }
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo generar el PDF del informe',
      confirmButtonColor: '#39a900'
    });
  }
};

    const handleDelete = async (item) => {
      let reportId;
      
      if (typeof item === "string") {
        reportId = item;
      } else if (item && typeof item === "object") {
        reportId = item.Id || item.id;
      } else {
        console.error("Formato de ID no válido:", item);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "ID de informe no válido",
          confirmButtonColor: "#39a900"
        });
        return;
      }

      if (!reportId) {
        console.error("ID de informe no encontrado");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "ID de informe no encontrado",
          confirmButtonColor: "#39a900"
        });
        return;
      }

      // Confirmación antes de eliminar
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "No podrás revertir esta acción",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      });

      if (result.isConfirmed) {
        try {
          await apiService.delete(`/work-report/${reportId}`);
          Swal.fire({
            icon: "success",
            title: "Eliminado",
            text: "El informe ha sido eliminado correctamente",
            confirmButtonColor: "#39a900"
          });

          // Opcional: actualizar la lista de informes
          await fetchData(); 
        } catch (error) {
          console.error("Error al eliminar el informe:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un problema al eliminar el informe",
            confirmButtonColor: "#39a900"
          });
        }
      }
    };

    const handleEdit = async (item) => {
      console.log("Item recibido para editar:", item);
      
      let reportId;
      
      if (typeof item === 'string') {
        reportId = item;
      } else if (item && typeof item === 'object') {
        reportId = item.Id || item.id;
      } else {
        console.error("Formato de ID no válido:", item);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'ID de informe no válido',
          confirmButtonColor: '#39a900'
        });
        return;
      }
      
      if (!reportId) {
        console.error("ID de informe no encontrado");
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'ID de informe no encontrado',
          confirmButtonColor: '#39a900'
        });
        return;
      }
      
      Cookies.set("Id_INF", String(reportId));
      console.log("ID guardado en cookie:", reportId);
      
      Cookies.remove("OrdenId");
      
      Cookies.set("EditMode", "true");
      
      router.push(`/RealizarInforme`);
    };

    // Iconos de acciones
    const icons = ref([
      { class: "fas fa-check", method: handleDownloadPDF },
      { class: "fas fa-trash", method: handleDelete },
      { class: "fas fa-edit", method: handleEdit },
    ]);

    onMounted(fetchData);

    return {
      headers,
      fields,
      icons,
      rows,
      isLoading,
      fetchData,
      handleEdit,
      handleDelete,
      handleDownloadPDF
    };
  },
};
</script>