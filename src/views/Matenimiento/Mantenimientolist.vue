<template>
    <div class="py-4 container-fluid">
      <div class="row">
        <div class="col-12">
          <AuthorsTable
            title="Gestión de Mantenimientos"
            :headers="headers"
            :rows="rows"
            :fields="fields"
            :icons="icons"
            :loading="isLoading"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import Cookies from "js-cookie";
  import Swal from "sweetalert2";
  import apiService from "../../service/apiservice";
  import AuthorsTable from "../components/AuthorsTable.vue";
  
  export default {
    components: {
      AuthorsTable,
    },
    setup() {
      // Estados
      const isLoading = ref(false);
      const rows = ref([]);
      const router = useRouter();
  
      // Definición de la tabla
      const headers = ref([
        "Tipo",
        "Orden de Trabajo",
        "Descripción",
        "Técnico",
        "Estado",
        "Fecha",
        "Acciones"
      ]);
  
      const fields = ref({
        Tipo: {
          value: "typeMaintenance",
          class: "align-middle",
          textClass: "text-xs font-weight-bold",
          formatter: (value) => {
            const typeClass = getTypeClass(value);
            return `<span class="badge ${typeClass}">${value || 'No especificado'}</span>`;
          }
        },
        "Orden de Trabajo": {
          value: "wordOrdenId",
          class: "align-middle",
          textClass: "text-xs font-weight-bold mb-0",
          formatter: (value) => {
            if (!value) return 'No disponible';
            const radicado = typeof value === 'object' ? value.radicado : value;
            return radicado || 'No disponible';
          }
        },
        "Descripción": {
          value: "description",
          class: "align-middle",
          textClass: "text-xs font-weight-bold",
          formatter: (value) => {
            if (!value) return 'Sin descripción';
            return value.length > 50 ? value.substring(0, 50) + '...' : value;
          }
        },
        "Técnico": {
          value: "technicalId",
          class: "align-middle",
          textClass: "text-xs font-weight-bold",
          formatter: (value) => {
            if (!value) return 'No asignado';
            const name = typeof value === 'object' ? value.name : value;
            return name || 'No asignado';
          }
        },
        "Estado": {
          value: "state",
          class: "align-middle",
          textClass: "text-xs font-weight-bold",
          formatter: (value) => {
            const stateClass = value ? "bg-gradient-success" : "bg-gradient-warning";
            const stateText = value ? "Completado" : "Pendiente";
            return `<span class="badge ${stateClass}">${stateText}</span>`;
          }
        },
        "Fecha": {
          value: "createdAt",
          class: "align-middle",
          textClass: "text-xs font-weight-bold",
          formatter: (value) => formatDate(value)
        },
        "Acciones": {
          value: "_id",
          class: "align-middle text-center",
          textClass: "text-xs font-weight-bold",
        }
      });
  
      // Métodos para manejar eventos de la tabla
      const viewMaintenanceDetails = (maintenance) => {
        // Guardar ID en cookie para la página de detalles
        Cookies.set('maintenanceId', maintenance._id, { expires: 1 });
        
        // Redirigir a la página de detalles
        router.push('/detalle-mantenimiento');
      };
  
      const consultarInforme = (maintenance) => {
        // Verificar si hay una orden de trabajo asociada
        if (!maintenance.wordOrdenId) {
          Swal.fire({
            title: 'Información',
            text: 'Este mantenimiento no tiene una orden de trabajo asociada.',
            icon: 'info',
            confirmButtonColor: '#39A900'
          });
          return;
        }
  
        // Guardar ID de la orden en cookie para la página de informes
        const orderId = typeof maintenance.wordOrdenId === 'object' 
          ? maintenance.wordOrdenId._id 
          : maintenance.wordOrdenId;
        
        Cookies.set('OrdenId', orderId, { expires: 1 });
        
        // Redirigir a la página de informes
        router.push('/informes');
      };
  
      const confirmDelete = (maintenance) => {
        Swal.fire({
          title: '¿Eliminar mantenimiento?',
          text: `¿Estás seguro de que deseas eliminar este registro de mantenimiento?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            deleteMaintenance(maintenance._id);
          }
        });
      };
  
      const deleteMaintenance = async (id) => {
        try {
          isLoading.value = true;
          await apiService.delete(`/maintenance/${id}`);
          
          // Actualizar la lista después de eliminar
          rows.value = rows.value.filter(record => record._id !== id);
          
          Swal.fire({
            title: '¡Eliminado!',
            text: 'El registro de mantenimiento ha sido eliminado correctamente.',
            icon: 'success',
            confirmButtonColor: '#39A900'
          });
        } catch (error) {
          console.error('Error al eliminar mantenimiento:', error);
          showErrorNotification('Error al eliminar el registro de mantenimiento');
        } finally {
          isLoading.value = false;
        }
      };
  
      // Ahora definimos los iconos con funciones anónimas que llaman a nuestros métodos
      const icons = ref([
        { 
          class: "fas fa-trash", 
          title: "Eliminar",
          method: (item) => confirmDelete(item)
        },
        { 
          class: "fas fa-search", 
          title: "Ver detalles",
          method: (item) => viewMaintenanceDetails(item)
        },
        { 
          class: "fas fa-file-alt", 
          title: "Consultar informe",
          method: (item) => consultarInforme(item)
        }
      ]);
  
      const fetchMaintenanceData = async () => {
        try {
          isLoading.value = true;
          const response = await apiService.get('/maintenance');
          
          if (Array.isArray(response)) {
            // Asignar directamente los datos sin transformación
            rows.value = response;
          } else {
            console.error('Respuesta de API inesperada:', response);
            rows.value = [];
          }
        } catch (error) {
          console.error('Error al obtener datos de mantenimiento:', error);
          showErrorNotification('Error al cargar los registros de mantenimiento');
          rows.value = [];
        } finally {
          isLoading.value = false;
        }
      };
  
      const formatDate = (dateString) => {
        if (!dateString) return 'No disponible';
        
        try {
          const date = new Date(dateString);
          return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        } catch (error) {
          return 'Fecha inválida';
        }
      };
  
      const getTypeClass = (type) => {
        if (!type) return 'bg-gradient-secondary';
        
        const typeLower = type.toLowerCase();
        if (typeLower.includes('preventivo')) {
          return 'bg-gradient-info';
        } else if (typeLower.includes('correctivo')) {
          return 'bg-gradient-warning';
        } else {
          return 'bg-gradient-primary';
        }
      };
  
      const showErrorNotification = (message) => {
        Swal.fire({
          title: 'Error',
          text: message,
          icon: 'error',
          confirmButtonColor: '#39A900'
        });
      };
  
      // Cargar datos al montar el componente
      onMounted(() => {
        fetchMaintenanceData();
      });
  
      return {
        isLoading,
        rows,
        headers,
        fields,
        icons
      };
    }
  };
  </script>