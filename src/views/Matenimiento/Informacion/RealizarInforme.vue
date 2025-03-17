<template>
  <div class="maintenance-report">
    <div class="logo-watermark"></div>
    
    <!-- Loading overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    
    <!-- Progress bar overlay -->
    <div v-if="showProgressBar" class="progress-overlay">
      <div class="progress-container">
        <h3>{{ progressTitle }}</h3>
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: `${progressValue}%` }"></div>
        </div>
        <p>{{ progressMessage }}</p>
      </div>
    </div>
    
    <div class="report-container">
      <header class="report-header">
        <div class="header-left">
          <h1>Gestión de actividades de mantenimiento</h1>
          <h2>{{ isEditMode ? 'Editar informe' : 'Nuevo informe de mantenimiento' }}</h2>
        </div>
        <div class="header-right">
          <div class="status-badge" :class="{ 'status-completed': isEditMode }">
            {{ isEditMode ? 'Informe existente' : 'Nuevo informe' }}
          </div>
        </div>
      </header>

      <div class="report-card">
        <div class="order-number-container">
          <div class="order-badge">
            <i class="fas fa-clipboard-list"></i>
            <label>{{ isEditMode ? 'Informe:' : 'Orden de trabajo:' }} 
              <span class="highlight-text">{{ isEditMode ? formData.Informe : (workOrder?.radicado || 'Cargando...') }}</span>
            </label>
          </div>
          
          <div class="date-badge">
            <i class="fas fa-calendar-alt"></i>
            <span>{{ formatDate(new Date()) }}</span>
          </div>
        </div>
        
        <div class="section-header">
          <h2><i class="fas fa-file-alt"></i> Datos del informe</h2>
          <button class="save-button" @click="saveReport">
            <i class="fas fa-save"></i> {{ isEditMode ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>
              <i class="fas fa-hashtag"></i> No. Informe
              <div class="tooltip">
                <i class="fas fa-info-circle"></i>
                <span class="tooltip-text">Código único del informe generado automáticamente</span>
              </div>
            </label>
            <div class="input-with-icon">
              <i class="fas fa-file-invoice"></i>
              <input type="text" v-model="formData.Informe" :readonly="true" class="highlighted-input" />
            </div>
          </div>
          
          <div class="form-group">
            <label>
              <i class="fas fa-dollar-sign"></i> Costo
              <span class="required">*</span>
            </label>
            <div class="input-with-icon">
              <i class="fas fa-money-bill-wave"></i>
              <input 
                type="text" 
                v-model="formData.cost" 
                placeholder="$ 000.000"
                @input="formatCost" 
                :class="{ 'error': validationErrors.cost }"
              />
            </div>
            <span v-if="validationErrors.cost" class="error-message">{{ validationErrors.cost }}</span>
          </div>
          
          <div class="form-group">
            <label>
              <i class="fas fa-clock"></i> Horas
              <span class="required">*</span>
            </label>
            <div class="input-with-icon">
              <i class="fas fa-hourglass-half"></i>
              <input 
                type="text" 
                v-model="formData.hours" 
                placeholder="24 horas"
                @input="formatHours" 
                :class="{ 'error': validationErrors.hours }"
              />
            </div>
            <span v-if="validationErrors.hours" class="error-message">{{ validationErrors.hours }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>
              <i class="fas fa-tools"></i> Repuestos
              <span class="required">*</span>
            </label>
            <div class="textarea-with-icon">
              <i class="fas fa-cogs"></i>
              <textarea 
                v-model="formData.responses" 
                placeholder="Detalle los repuestos utilizados..."
                class="parts-textarea"
                :class="{ 'error': validationErrors.responses }"
              ></textarea>
            </div>
            <span v-if="validationErrors.responses" class="error-message">{{ validationErrors.responses }}</span>
          </div>
          
          <div class="form-group">
            <label>
              <i class="fas fa-tasks"></i> Trabajo realizado
              <span class="required">*</span>
            </label>
            <div class="textarea-with-icon">
              <i class="fas fa-hammer"></i>
              <textarea 
                v-model="formData.workDone" 
                placeholder="Describa el trabajo realizado"
                :class="{ 'error': validationErrors.workDone }"
              ></textarea>
            </div>
            <span v-if="validationErrors.workDone" class="error-message">{{ validationErrors.workDone }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label>
              <i class="fas fa-comment-alt"></i> Observaciones
            </label>
            <div class="textarea-with-icon">
              <i class="fas fa-clipboard-check"></i>
              <textarea 
                v-model="formData.observation"
                placeholder="Ingrese observaciones adicionales..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="report-card" v-if="!isEditMode || (isEditMode && showAssetInfo)">
        <h2 class="asset-info-header">
          <i class="fas fa-desktop"></i> Información del bien
          <button class="toggle-button" @click="toggleAssetInfo">
            <i :class="showAssetDetails ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
          </button>
        </h2>
        
        <div class="info-grid" v-if="showAssetDetails">
          <div class="info-column">
            <div class="info-group">
              <label><i class="fas fa-building"></i> Centro de formación</label>
              <p>{{ assetInfo.trainingCenterId?.[0]?.name || 'No disponible' }}</p>
            </div>
            
            <div class="info-group">
              <label><i class="fas fa-tag"></i> Marca</label>
              <p>{{ assetInfo.brand || 'No disponible' }}</p>
            </div>
            
            <div class="info-group">
              <label><i class="fas fa-barcode"></i> Número de serie</label>
              <p>{{ assetInfo.serialNumber || 'No disponible' }}</p>
            </div>
          </div>
          
          <div class="info-column">
            <div class="info-group">
              <label><i class="fas fa-map-marker-alt"></i> Ubicación</label>
              <p>{{ assetInfo.location || 'No disponible' }}</p>
            </div>
            
            <div class="info-group">
              <label><i class="fas fa-laptop"></i> Modelo</label>
              <p>{{ assetInfo.modelo || 'No disponible' }}</p>
            </div>
            
            <div class="info-group">
              <label><i class="fas fa-cog"></i> Tipo de equipo</label>
              <p>{{ assetInfo.equipmentType || 'No disponible' }}</p>
            </div>
          </div>
          
          <div class="info-column">
            <div class="info-group">
              <label><i class="fas fa-calendar-plus"></i> Fecha de adquisición</label>
              <p>{{ formatDate(assetInfo.acquisitionDate) || 'No disponible' }}</p>
            </div>
            
            <div class="info-group">
              <label><i class="fas fa-user-tie"></i> Cuentadante</label>
              <p>{{ assetInfo.accountant || 'No disponible' }}</p>
            </div>
            
            <div class="info-group">
              <label><i class="fas fa-info-circle"></i> Estado</label>
              <p class="status-text" :class="getStatusClass(assetInfo.status)">
                {{ assetInfo.status || 'No disponible' }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="asset-preview" v-if="!showAssetDetails">
          <div class="preview-item">
            <label><i class="fas fa-tag"></i> Marca:</label>
            <p>{{ assetInfo.brand || 'No disponible' }}</p>
          </div>
          <div class="preview-item">
            <label><i class="fas fa-barcode"></i> Serie:</label>
            <p>{{ assetInfo.serialNumber || 'No disponible' }}</p>
          </div>
          <div class="preview-item">
            <label><i class="fas fa-map-marker-alt"></i> Ubicación:</label>
            <p>{{ assetInfo.location || 'No disponible' }}</p>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <button class="cancel-button" @click="confirmCancel">
          <i class="fas fa-times"></i> Cancelar
        </button>
        <button class="preview-button" @click="previewReport">
          <i class="fas fa-eye"></i> Vista previa
        </button>
        <button class="save-button" @click="saveReport">
          <i class="fas fa-save"></i> {{ isEditMode ? 'Actualizar' : 'Guardar' }}
        </button>
      </div>
    </div>
    
    <!-- Modal de vista previa -->
    <div v-if="showPreviewModal" class="preview-modal-backdrop" @click.self="closePreview">
      <div class="preview-modal">
        <div class="preview-modal-header">
          <h3><i class="fas fa-file-alt"></i> Vista previa del informe</h3>
          <button type="button" class="close-button" @click="closePreview">&times;</button>
        </div>
        
        <div class="preview-modal-body">
          <div class="preview-section">
            <h4>Información general</h4>
            <div class="preview-grid">
              <div class="preview-item">
                <label>No. Informe:</label>
                <p>{{ formData.Informe }}</p>
              </div>
              <div class="preview-item">
                <label>Orden de trabajo:</label>
                <p>{{ workOrder?.radicado || 'No disponible' }}</p>
              </div>
              <div class="preview-item">
                <label>Costo:</label>
                <p>{{ formData.cost }}</p>
              </div>
              <div class="preview-item">
                <label>Horas:</label>
                <p>{{ formData.hours }}</p>
              </div>
            </div>
          </div>
          
          <div class="preview-section">
            <h4>Detalles del trabajo</h4>
            <div class="preview-text-block">
              <label>Repuestos:</label>
              <p>{{ formData.responses || 'No se especificaron repuestos' }}</p>
            </div>
            <div class="preview-text-block">
              <label>Trabajo realizado:</label>
              <p>{{ formData.workDone || 'No se especificó el trabajo realizado' }}</p>
            </div>
            <div class="preview-text-block">
              <label>Observaciones:</label>
              <p>{{ formData.observation || 'No se especificaron observaciones' }}</p>
            </div>
          </div>
          
          <div class="preview-section" v-if="showAssetInfo">
            <h4>Información del bien</h4>
            <div class="preview-grid">
              <div class="preview-item">
                <label>Marca:</label>
                <p>{{ assetInfo.brand || 'No disponible' }}</p>
              </div>
              <div class="preview-item">
                <label>Modelo:</label>
                <p>{{ assetInfo.modelo || 'No disponible' }}</p>
              </div>
              <div class="preview-item">
                <label>Serie:</label>
                <p>{{ assetInfo.serialNumber || 'No disponible' }}</p>
              </div>
              <div class="preview-item">
                <label>Ubicación:</label>
                <p>{{ assetInfo.location || 'No disponible' }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="preview-modal-footer">
          <button type="button" class="cancel-button" @click="closePreview">
            <i class="fas fa-times"></i> Cerrar
          </button>
          <button type="button" class="print-button" @click="printReport">
            <i class="fas fa-print"></i> Imprimir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import apiService from "../../../service/apiservice";
import { useRouter } from 'vue-router';

export default {
  name: 'MaintenanceReport',
  setup() {
    const router = useRouter();
    const radicado = ref('');
    const wordOrdenId = ref('');
    const workOrder = ref(null);
    const reportId = ref('');
    const isEditMode = ref(false);
    const showAssetInfo = ref(true);
    const showAssetDetails = ref(false);
    const isLoading = ref(false);
    const showProgressBar = ref(false);
    const progressValue = ref(0);
    const progressTitle = ref('');
    const progressMessage = ref('');
    const showPreviewModal = ref(false);
    
    const validationErrors = ref({
      cost: '',
      hours: '',
      responses: '',
      workDone: ''
    });
    
    const assetInfo = ref({
      trainingCenter: '',
      location: '',
      acquisitionDate: '',
      brand: '',
      model: '',
      accountant: '',
      serialNumber: '',
      equipmentType: '',
      status: ''
    });
    
    const formData = ref({
      Informe: '',
      cost: '',
      hours: '',
      responses: '',
      workDone: '',
      observation: '',
      contactName: '',
      phone: '',
      trackingNumber: '',
      orderId: '',
      _id: ''
    });

    // Método para mostrar la barra de progreso
    const showProgress = (title, message, initialValue = 0) => {
      progressTitle.value = title;
      progressMessage.value = message;
      progressValue.value = initialValue;
      showProgressBar.value = true;
    };
    
    // Método para actualizar el progreso
    const updateProgress = (value, message = null) => {
      progressValue.value = value;
      if (message) {
        progressMessage.value = message;
      }
    };
    
    // Método para ocultar la barra de progreso
    const hideProgress = () => {
      showProgressBar.value = false;
    };
    
    // Método para mostrar/ocultar los detalles del activo
    const toggleAssetInfo = () => {
      showAssetDetails.value = !showAssetDetails.value;
    };
    
    // Método para obtener la clase CSS según el estado del activo
    const getStatusClass = (status) => {
  if (!status || typeof status !== 'string') return ''; // Evita el error si no es string

  const statusLower = status.toLowerCase();
  if (statusLower.includes('activo') || statusLower.includes('bueno')) {
    return 'status-active';
  } else if (statusLower.includes('reparación') || statusLower.includes('mantenimiento')) {
    return 'status-maintenance';
  } else if (statusLower.includes('baja') || statusLower.includes('malo')) {
    return 'status-inactive';
  }

  return '';
};


    // Función para formatear la fecha
    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // Función para formatear el costo
    const formatCost = (event) => {
      let value = event.target.value.replace(/[^\d]/g, '');
      if (value) {
        value = parseInt(value).toLocaleString('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        });
        formData.value.cost = value;
      }
      
      // Limpiar error si se ha ingresado un valor
      if (formData.value.cost) {
        validationErrors.value.cost = '';
      }
    };

    // Función para formatear las horas
    const formatHours = (event) => {
      let value = event.target.value.replace(/[^\d]/g, '');
      if (value) {
        formData.value.hours = `${value} horas`;
      }
      
      // Limpiar error si se ha ingresado un valor
      if (formData.value.hours) {
        validationErrors.value.hours = '';
      }
    };
    
    // Función para validar el formulario
    const validateForm = () => {
      let isValid = true;
      
      // Limpiar errores anteriores
      Object.keys(validationErrors.value).forEach(key => {
        validationErrors.value[key] = '';
      });
      
      if (!formData.value.cost) {
        validationErrors.value.cost = 'El costo es obligatorio';
        isValid = false;
      }
      
      if (!formData.value.hours) {
        validationErrors.value.hours = 'Las horas son obligatorias';
        isValid = false;
      }
      
      if (!formData.value.responses) {
        validationErrors.value.responses = 'Los repuestos son obligatorios';
        isValid = false;
      }
      
      if (!formData.value.workDone) {
        validationErrors.value.workDone = 'El trabajo realizado es obligatorio';
        isValid = false;
      }
      
      return isValid;
    };
    
    const generateReportCode = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const sequential = Math.floor(Math.random() * 9000) + 1000;
      
      // Formato: INF-YYYYMMDDXXXX donde XXXX es un número secuencial
      formData.value.Informe = `INF-${year}${month}${day}-${sequential}`;
      return formData.value.Informe;
    };

    // Función para cargar datos de un informe existente
    const fetchReportData = async (id) => {
      try {
        isLoading.value = true;
        
        const response = await apiService.get(`/work-report/${id}`);
        
        if (!response) {
          throw new Error('No se encontró el informe');
        }
        
        // Mapear los datos del informe al formulario
        formData.value = {
          Informe: response.Informe || '',
          cost: response.costs ? response.costs.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }) : '',
          hours: response.hours ? `${response.hours} horas` : '',
          responses: response.responses || '',
          workDone: response.workDone || '',
          observation: response.observation || '',
          orderId: response.orderId || '',
          _id: response._id || id
        };
        
        // Si hay ID de orden, intentar cargar información del activo
        if (response.orderId) {
          try {
            const orderResponse = await apiService.get(`/word-orden/${response.orderId}`);
            if (orderResponse && orderResponse.solicitud && orderResponse.solicitud._id) {
              await fetchAssetInfo(orderResponse.solicitud._id);
              showAssetInfo.value = true;
            } else {
              showAssetInfo.value = false;
            }
          } catch (error) {
            console.error('Error al cargar información de la orden:', error);
            showAssetInfo.value = false;
          }
        } else {
          showAssetInfo.value = false;
        }
        
        isLoading.value = false;
        
      } catch (error) {
        console.error('Error al cargar el informe:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el informe',
          confirmButtonColor: '#39a900'
        });
        router.push('/Informes');
      }
    };

    const fetchData = async () => {
      try {
        // Verificar si estamos en modo edición
        const editMode = Cookies.get('EditMode');
        const reportIdFromCookie = Cookies.get('Id_INF');
        
        if (editMode === 'true' && reportIdFromCookie) {
          // Estamos en modo edición
          isEditMode.value = true;
          reportId.value = reportIdFromCookie;
          
          // Cargar datos del informe
          await fetchReportData(reportIdFromCookie);
          
        } else {
          // Estamos en modo creación
          isEditMode.value = false;
          
          isLoading.value = true;
          
          const Id = Cookies.get('OrdenId');
          if (!Id) throw new Error('No se encontró el ID de la orden');
          
          wordOrdenId.value = Id;
          formData.value.orderId = Id;
          
          const response = await apiService.get(`/word-orden/${Id}`);
          workOrder.value = response;
          radicado.value = response?.radicado || '';
          
          if (workOrder.value?.solicitud?._id) {
            await fetchAssetInfo(workOrder.value.solicitud._id);
          }
          
          generateReportCode();
          
          isLoading.value = false;
        }
        
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los datos',
          confirmButtonColor: '#39a900'
        });
      }
    };

    const fetchAssetInfo = async (solicitudId) => {
      try {
        const response = await apiService.get(`/application-maintenance/Consultar/${solicitudId}`);
        if (response?.data?.assetInfo || response?.assetInfo) {
          assetInfo.value = response.data?.assetInfo || response.assetInfo;
          
          if (response.requesterName) {
            formData.value.contactName = response.requesterName;
          }
          if (response.requesterPhone) {
            formData.value.phone = response.requesterPhone;
          }
          if (response.trackingNumber) {
            formData.value.trackingNumber = response.trackingNumber;
          }
        }
      } catch (error) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'No se pudo cargar la información del activo',
          toast: true,
          position: 'top-end',
          timer: 3000
        });
      }
    };
    
    // Función para mostrar la vista previa del informe
    const previewReport = () => {
      if (!validateForm()) {
        Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: 'Por favor complete todos los campos obligatorios',
          confirmButtonColor: '#39a900'
        });
        return;
      }
      
      showPreviewModal.value = true;
    };
    
    // Función para cerrar la vista previa
    const closePreview = () => {
      showPreviewModal.value = false;
    };
    
    // Función para imprimir el informe
    const printReport = () => {
      window.print();
    };
    
    // Función para confirmar cancelación
    const confirmCancel = () => {
      Swal.fire({
        title: '¿Está seguro?',
        text: 'Se perderán los cambios no guardados',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#39a900',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'No, continuar editando'
      }).then((result) => {
        if (result.isConfirmed) {
          // Limpiar cookies
          Cookies.remove('EditMode');
          Cookies.remove('Id_INF');
          Cookies.remove('OrdenId');
          
          // Redirigir a la lista de informes
          router.push('/gestiones');
        }
      });
    };
    
    const saveReport = async () => {
      if (!validateForm()) {
        Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: 'Por favor complete todos los campos obligatorios',
          confirmButtonColor: '#39a900'
        });
        return;
      }
      
      try {
        // Mostrar barra de progreso
        showProgress(isEditMode.value ? 'Actualizando informe' : 'Guardando informe', 'Preparando datos...', 10);
        
        // Preparar datos para enviar
        const reportData = {
          Informe: formData.value.Informe,
          costs: parseFloat(formData.value.cost.replace(/[^\d.-]/g, '')),
          hours: parseInt(formData.value.hours),
          responses: formData.value.responses,
          observation: formData.value.observation,
          workDone: formData.value.workDone,
          orderId: formData.value.orderId,
          status: true
        };
        
        updateProgress(30, 'Enviando datos al servidor...');
        
        let response;
        
        if (isEditMode.value) {
          // Actualizar informe existente
          response = await apiService.patch(`/work-report/${formData.value._id}`, reportData);
        } else {
          // Crear nuevo informe
          response = await apiService.post('/work-report', reportData);
        }
        
        updateProgress(70, 'Finalizando...');
        
        if (response.success || response._id) {
          // Limpiar cookies después de guardar
          Cookies.remove('EditMode');
          Cookies.remove('Id_INF');
          Cookies.remove('OrdenId');
          
          updateProgress(100, isEditMode.value ? '¡Informe actualizado correctamente!' : '¡Informe guardado correctamente!');
          
          // Ocultar barra de progreso después de un tiempo
          setTimeout(() => {
            hideProgress();
            
            Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: isEditMode.value ? 'Informe actualizado correctamente' : 'Informe guardado correctamente',
              confirmButtonColor: '#39a900'
            }).then(() => {
              // Redirigir a la lista de informes
              router.push('/gestiones');
            });
          }, 1000);
        } else {
          throw new Error(isEditMode.value ? 'Error al actualizar el informe' : 'Error al guardar el informe');
        }
      } catch (error) {
        hideProgress();
        console.error('Error al guardar:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo guardar el informe',
          confirmButtonColor: '#39a900'
        });
      }
    };
    
    onMounted(() => {
      fetchData();
      
      // Limpiar cookies al desmontar el componente
      return () => {
        if (!isEditMode.value) {
          Cookies.remove('EditMode');
          Cookies.remove('Id_INF');
          Cookies.remove('OrdenId');
        }
      };
    });
    
    return {
      radicado,
      workOrder,
      assetInfo,
      formData,
      isEditMode,
      showAssetInfo,
      showAssetDetails,
      isLoading,
      validationErrors,
      saveReport,
      generateReportCode,
      formatDate,
      formatCost,
      formatHours,
      toggleAssetInfo,
      getStatusClass,
      previewReport,
      closePreview,
      printReport,
      confirmCancel,
      showPreviewModal
    };
  }
}
</script>

<style scoped>
.maintenance-report {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Arial, sans-serif;
  position: relative;
}

.logo-watermark {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="50" font-size="80" text-anchor="middle" dominant-baseline="middle" fill="rgba(57, 169, 0, 0.03)">SENA</text></svg>');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 80% 80%;
  pointer-events: none;
  z-index: -1;
}

/* Loading overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  border: 4px solid rgba(57, 169, 0, 0.3);
  border-radius: 50%;
  border-top: 4px solid #39a900;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Progress bar overlay */
.progress-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.progress-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 24px;
  width: 90%;
  max-width: 500px;
  text-align: center;
}

.progress-container h3 {
  color: #39a900;
  margin-top: 0;
  margin-bottom: 16px;
}

.progress-bar-container {
  height: 10px;
  background-color: #e9ecef;
  border-radius: 5px;
  margin-bottom: 16px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #39a900;
  border-radius: 5px;
  transition: width 0.3s ease;
}

.progress-container p {
  margin: 0;
  color: #555;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
}

.status-badge {
  background-color: #e8f5e9;
  color: #39a900;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge.status-completed {
  background-color: #e3f2fd;
  color: #1976d2;
}

.report-header h1 {
  color: #ffffff;
  font-size: 24px;
  margin: 0;
  margin-bottom: 8px;
}

.report-header h2 {
  color: #494949;
  font-size: 20px;
  margin: 0;
}

.report-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-number-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.order-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.order-badge i {
  color: #39a900;
}

.date-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.date-badge i {
  color: #39a900;
}

.highlight-text {
  color: #39a900;
  font-weight: 600;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  color: #39a900;
  font-size: 20px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-button {
  background: #39a900;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-button:hover {
  background: #2d8500;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 14px;
  color: #555;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.required {
  color: #dc3545;
  margin-left: 2px;
}

.input-with-icon, .textarea-with-icon {
  position: relative;
}

.input-with-icon i, .textarea-with-icon i {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.textarea-with-icon i {
  top: 16px;
  transform: none;
}

.input-with-icon input, .textarea-with-icon textarea {
  padding: 10px 12px 10px 36px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
}

.input-with-icon input:focus, .textarea-with-icon textarea:focus {
  border-color: #39a900;
  outline: none;
  box-shadow: 0 0 0 3px rgba(57, 169, 0, 0.2);
}

.highlighted-input {
  background-color: #f8f9fa;
  font-weight: 500;
  color: #39a900;
}

.textarea-with-icon textarea {
  resize: vertical;
  min-height: 100px;
}

.error {
  border-color: #dc3545 !important;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
}

.parts-textarea {
  min-height: 100px;
}

.asset-info-header {
  color: #39a900;
  font-size: 20px;
  margin: 0 0 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-button {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  transition: color 0.2s;
}

.toggle-button:hover {
  color: #39a900;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
}

.info-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-group label {
  font-size: 14px;
  color: #555;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-group p {
  font-size: 14px;
  color: #333;
  margin: 0;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.status-text {
  font-weight: 500;
}

.status-active {
  color: #28a745;
  background-color: #e8f5e9 !important;
}

.status-maintenance {
  color: #fd7e14;
  background-color: #fff3e0 !important;
}

.status-inactive {
  color: #dc3545;
  background-color: #ffebee !important;
}

.asset-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-item label {
  font-size: 14px;
  color: #555;
  font-weight: 500;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.preview-item p {
  font-size: 14px;
  color: #333;
  margin: 0;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-button, .preview-button, .print-button {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.cancel-button {
  border: 1px solid #ced4da;
  background-color: white;
  color: #555;
}

.preview-button {
  border: 1px solid #39a900;
  background-color: white;
  color: #39a900;
}

.print-button {
  border: 1px solid #1976d2;
  background-color: white;
  color: #1976d2;
}

.cancel-button:hover {
  background-color: #f8f9fa;
}

.preview-button:hover {
  background-color: #f1f8e9;
}

.print-button:hover {
  background-color: #e3f2fd;
}

/* Modal de vista previa */
.preview-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.preview-modal {
  background-color: white;
  border-radius: 8px;
  width: 800px;
  max-width: 95%;
  max-height: 90vh;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.preview-modal-header {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-modal-header h3 {
  margin: 0;
  color: #39a900;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
}

.preview-modal-body {
  padding: 16px;
  overflow-y: auto;
}

.preview-section {
  margin-bottom: 24px;
}

.preview-section h4 {
  color: #39a900;
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 8px;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.preview-text-block {
  margin-bottom: 16px;
}

.preview-text-block label {
  font-size: 14px;
  color: #555;
  font-weight: 500;
  display: block;
  margin-bottom: 8px;
}

.preview-text-block p {
  font-size: 14px;
  color: #333;
  margin: 0;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  white-space: pre-wrap;
}

.preview-modal-footer {
  padding: 16px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Tooltip styles */
.tooltip {
  position: relative;
  display: inline-block;
  margin-left: 5px;
  cursor: help;
}

.tooltip .tooltip-text {
  visibility: hidden;
  width: 200px;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -100px;
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/* Responsive styles */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .save-button {
    width: 100%;
  }
  
  .report-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-right {
    width: 100%;
  }
  
  .order-number-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .date-badge {
    align-self: flex-end;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .cancel-button, .preview-button, .save-button {
    width: 100%;
  }
  
  .preview-modal-footer {
    flex-direction: column;
  }
  
  .cancel-button, .print-button {
    width: 100%;
  }
}

@media print {
  .maintenance-report {
    padding: 0;
  }
  
  .report-card {
    box-shadow: none;
    border: 1px solid #ddd;
    page-break-inside: avoid;
  }
  
  .action-buttons, .toggle-button, .preview-modal-backdrop {
    display: none !important;
  }
  
  .logo-watermark {
    opacity: 0.1;
  }
}
</style>