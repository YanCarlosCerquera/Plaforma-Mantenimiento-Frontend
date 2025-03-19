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
    const jwt_decode = require("jwt-decode");

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
        value: "orderId.solicitud.InventoryCode",
        class: "align-middle",
        textClass: "text-xs font-weight-bold mb-0",
      },
      Horas: {
        value: "hours",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
      },
      Costos: {
        value: "costs",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
      },
      TrabajoRealizado: {
        value: "workDone",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
      },
      EjecutadoPor: {
        value: "orderId.tecnicoId.name",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
      },
    });

    const normalizeText = (text) => {
      return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };

    const fetchData = async () => {
      isLoading.value = true;
      try {
        const token = Cookies.get("authToken");
        if (!token) {
          console.error("No se encontró el token de autenticación");
          return;
        }
        const decodedToken = jwt_decode.jwtDecode(token);
        const userId = decodedToken.sub;

        const menuCookie = Cookies.get("menu"); 
        const menu = menuCookie ? JSON.parse(menuCookie) : null; 
        const role = menu ? menu.role : null; 

        let url = '/work-report';

        if (role === 'instructor' || role === 'técnico') {
          const normalizedRole = normalizeText(role); 
          url += `?${normalizedRole}Id=${userId}`;
        }

        const response = await apiService.get(url);
        
        // Asegurarse de que cada elemento tenga un ID accesible
        rows.value = response.map((item) => ({
          ...item,
          id: item._id || item.Id || item.id
        }));
        
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
      console.log("Item recibido para descargar PDF:", item);
      
      // Extraer el ID del informe de manera más robusta
      let reportId;
      
      if (typeof item === 'string') {
        reportId = item;
      } else if (item && typeof item === 'object') {
        // Intentar obtener el ID de todas las posibles propiedades
        reportId = item._id || item.Id || item.id;
      }
      
      if (!reportId) {
        console.error("ID de informe no encontrado:", item);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo identificar el ID del informe',
          confirmButtonColor: '#39a900'
        });
        return;
      }
      
      console.log("ID del informe a descargar:", reportId);
      
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
        
        try {
          // Intentar descargar como blob
          const response = await apiService.getBlob(`/work-report/pdf/${reportId}`);
          
          if (!response || !(response instanceof Blob)) {
            throw new Error("La respuesta no es un blob válido");
          }
          
          // Crear URL y descargar
          const url = window.URL.createObjectURL(response);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `informe-${reportId}.pdf`);
          document.body.appendChild(link);
          link.click();
          
          // Limpiar
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
          }, 100);
          
          Swal.fire({
            icon: 'success',
            title: 'PDF Generado',
            text: 'El informe se ha descargado correctamente',
            confirmButtonColor: '#39a900'
          });
        } catch (blobError) {
          console.error("Error al descargar como blob:", blobError);
          
          // Plan B: Abrir en nueva pestaña
          const pdfUrl = `${apiService.getBaseUrl()}/work-report/pdf/${reportId}`;
          const newWindow = window.open(pdfUrl, '_blank');
          
          if (!newWindow) {
            throw new Error("No se pudo abrir una nueva ventana. Verifique que los popups estén permitidos.");
          }
          
          Swal.close();
        }
      } catch (error) {
        console.error("Error al generar el PDF:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo generar el PDF del informe: ' + error.message,
          confirmButtonColor: '#39a900'
        });
      }
    };

    const handleDelete = async (item) => {
      console.log("Item recibido para eliminar:", item);
      
      // Extraer el ID del informe de manera más robusta
      let reportId;
      
      if (typeof item === 'string') {
        reportId = item;
      } else if (item && typeof item === 'object') {
        // Intentar obtener el ID de todas las posibles propiedades
        reportId = item._id || item.Id || item.id;
      }
      
      if (!reportId) {
        console.error("ID de informe no encontrado:", item);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo identificar el ID del informe',
          confirmButtonColor: '#39a900'
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

          // Actualizar la lista de informes
          await fetchData(); 
        } catch (error) {
          console.error("Error al eliminar el informe:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un problema al eliminar el informe: " + error.message,
            confirmButtonColor: "#39a900"
          });
        }
      }
    };

    const handleEdit = async (item) => {
      
      // Extraer el ID del informe de manera más robusta
      let reportId;
      
      if (typeof item === 'string') {
        reportId = item;
      } else if (item && typeof item === 'object') {
        // Intentar obtener el ID de todas las posibles propiedades
        reportId = item._id || item.Id || item.id;
      }
      
      if (!reportId) {
        console.error("ID de informe no encontrado:", item);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo identificar el ID del informe',
          confirmButtonColor: '#39a900'
        });
        return;
      }
      
      // Guardar ID en cookie
      Cookies.set("Id_INF", String(reportId));
      
      // Limpiar cookie de orden si existe
      Cookies.remove("OrdenId");
      
      // Establecer modo de edición
      Cookies.set("EditMode", "true");
      
      // Navegar a la página de edición
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