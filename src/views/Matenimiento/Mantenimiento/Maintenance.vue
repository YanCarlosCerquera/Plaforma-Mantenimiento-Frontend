<template>
  <div class="maintenance-form">
    <div class="background-watermark"></div>
    
    <div class="form-section top-section">
      <div class="header-row">
        <div class="search-container">
          <ArgonAutocomplete 
            placeholder="Buscar por radicado o activo..."
            :items="workOrders"
            v-model="selectedRadicado"
            @update:modelValue="handleWorkOrderSelect"
          />
        </div>
        <div class="title-actions">
          <h2 class="main-title">Orden de Trabajo</h2>
          
          <button class="action-button" @click="generatePdfReport">
            <span>Realizar informe</span>
            <i class="fas fa-file-pdf"></i>
          </button>
        </div>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label for="serialNumber">Numero de serie</label>
          <input type="text" id="serialNumber" v-model="formData.serialNumber" class="form-input" readonly>
        </div>
        <div class="form-group">
          <label for="plateNumber">Numero de placa</label>
          <input type="text" id="plateNumber" v-model="formData.plateNumber" class="form-input" readonly>
        </div>
        <div class="form-group">
          <label for="startDate">Fecha inicio</label>
          <input type="date" id="startDate" v-model="formData.startDate" class="form-input" readonly>
        </div>
        <div class="form-group">
          <label for="contactName">Nombre de contacto</label>
          <input type="text" id="contactName" v-model="formData.contactName" class="form-input" readonly>
        </div>
        <div class="form-group">
          <label for="phone">Teléfono</label>
          <input type="text" id="phone" v-model="formData.phone" class="form-input" readonly>
        </div>
        <div class="form-group">
          <label for="endDate">Fecha fin</label>
          <input type="date" id="endDate" v-model="formData.endDate" class="form-input" readonly>
        </div>
        <div class="form-group">
          <label for="location">Ubicación</label>
          <input type="text" id="location" v-model="formData.location" class="form-input" readonly>
        </div>
        <div class="form-group">
          <label for="trackingNumber">Número de seguimiento</label>
          <input type="text" id="trackingNumber" v-model="formData.trackingNumber" class="form-input" readonly>
        </div>
        <div class="form-group">
          <label for="prioridad">Prioridad</label>
          <input type="text" id="prioridad" v-model="formData.prioridad" class="form-input" readonly>
        </div>
      </div>
    </div>

    <div class="form-section bottom-section">
      <h2 class="section-title">Trabajo realizado</h2>

      <div class="two-columns">
        <div class="column">
          <div class="form-group">
            <label class="label-text">Mantenimiento realizado <span class="required">*</span></label>
            <div class="checkbox-group">
              <label class="checkbox-label" :class="{ 'selected': maintenanceType === 'Preventivo' }">
                <input type="radio" name="maintenanceType" value="Preventivo" v-model="maintenanceType">
                <span>Preventivo</span>
              </label>
              <label class="checkbox-label" :class="{ 'selected': maintenanceType === 'Correctivo' }">
                <input type="radio" name="maintenanceType" value="Correctivo" v-model="maintenanceType">
                <span>Correctivo</span>
              </label>
            </div>
            <span v-if="validationErrors.maintenanceType" class="error-message">
              {{ validationErrors.maintenanceType }}
            </span>
          </div>

          <div class="form-group">
            <label for="workDescription">Descripción del trabajo y/o servicio solicitado <span class="required">*</span></label>
            <textarea 
              id="workDescription" 
              v-model="formData.workDescription" 
              class="form-textarea" 
              rows="4"
              placeholder="Describa el trabajo realizado..."
              :class="{ 'error': validationErrors.workDescription }"
            ></textarea>
            <span v-if="validationErrors.workDescription" class="error-message">
              {{ validationErrors.workDescription }}
            </span>
          </div>

          <div class="form-group">
            <label for="observations">Observaciones <span class="required">*</span></label>
            <textarea 
              id="observations" 
              v-model="formData.observations" 
              class="form-textarea" 
              rows="3"
              placeholder="Ingrese observaciones adicionales..."
              :class="{ 'error': validationErrors.observations }"
            ></textarea>
            <span v-if="validationErrors.observations" class="error-message">
              {{ validationErrors.observations }}
            </span>
          </div>
        </div>

        <div class="column">
          <div class="form-group">
            <label class="label-text">Repuestos requeridos <span class="required">*</span></label>
            <div class="checkbox-group">
              <label class="checkbox-label" :class="{ 'selected': sparePartsStatus === 'Si' }">
                <input type="radio" name="sparePartsStatus" value="Si" v-model="sparePartsStatus">
                <span>Si</span>
              </label>
              <label class="checkbox-label" :class="{ 'selected': sparePartsStatus === 'No' }">
                <input type="radio" name="sparePartsStatus" value="No" v-model="sparePartsStatus">
                <span>No</span>
              </label>
              <label class="checkbox-label" :class="{ 'selected': sparePartsStatus === 'No aplica' }">
                <input type="radio" name="sparePartsStatus" value="No aplica" v-model="sparePartsStatus">
                <span>No aplica</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="partsDetails">Detalle de repuestos <span v-if="sparePartsStatus === 'Si'" class="required">*</span></label>
            <textarea 
              id="partsDetails" 
              v-model="formData.partsDetails" 
              class="form-textarea" 
              rows="4"
              placeholder="Detalle los repuestos utilizados..."
              :disabled="sparePartsStatus === 'No' || sparePartsStatus === 'No aplica'"
              :class="{ 'error': validationErrors.partsDetails }"
            ></textarea>
            <span v-if="validationErrors.partsDetails" class="error-message">
              {{ validationErrors.partsDetails }}
            </span>
          </div>
        </div>
      </div>

      <div class="bottom-row">
        <div class="form-group">
          <label class="label-text">Estado Orden de trabajo <span class="required">*</span></label>
          <div class="checkbox-group">
            <label class="checkbox-label" :class="{ 'selected': orderState }">
              <input type="radio" name="orderState" :value="true" v-model="orderState">
              <span>Ejecutado</span>
            </label>
            <label class="checkbox-label" :class="{ 'selected': orderState === false }">
              <input type="radio" name="orderState" :value="false" v-model="orderState">
              <span>Pendiente</span>
            </label>
          </div>
        </div>
        <div class="form-group">
          <label for="executedBy">Ejecutado por:</label>
          <input type="text" id="executedBy" v-model="formData.executedBy" class="form-input" readonly>
        </div>
        
        <!-- Componente de firma digital con opción de carga de imagen -->
        <div class="form-group">
          <label for="techSignature">Firma técnico <span class="required">*</span></label>
          <div class="signature-container">
            <div v-if="formData.techSignature" class="signature-preview">
              <img :src="formData.techSignature" alt="Firma" class="signature-image" />
              <button type="button" @click="removeSignature" class="remove-signature-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div v-else class="signature-buttons">
              <button 
                type="button" 
                @click="openSignatureModal" 
                class="signature-button"
                :class="{ 'error': validationErrors.techSignature }"
              >
                <i class="fas fa-pen"></i> Dibujar firma
              </button>
              <div class="or-divider">o</div>
              <label class="upload-button">
                <i class="fas fa-upload"></i> Subir imagen
                <input 
                  type="file" 
                  accept="image/*" 
                  @change="handleImageUpload" 
                  class="file-input"
                />
              </label>
            </div>
            <span v-if="validationErrors.techSignature" class="error-message">
              {{ validationErrors.techSignature }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Modal de firma -->
      <div v-if="showSignatureModal" class="signature-modal-backdrop" @click.self="cancelSignature">
        <div class="signature-modal">
          <div class="signature-modal-header">
            <h3>Firma Digital</h3>
            <button type="button" class="close-button" @click="cancelSignature">&times;</button>
          </div>
          
          <div class="signature-modal-body">
            <VueSignaturePad
              ref="signaturePad"
              :width="modalWidth"
              :height="300"
              :options="{ penColor: 'rgb(57, 169, 0)' }"
            />
            <p class="signature-instructions">Dibuje su firma en el área de arriba</p>
          </div>
          
          <div class="signature-modal-footer">
            <button type="button" class="cancel-button" @click="cancelSignature">
              <i class="fas fa-times"></i> Cancelar
            </button>
            <button type="button" class="clear-button" @click="clearSignature">
              <i class="fas fa-eraser"></i> Limpiar
            </button>
            <button type="button" class="save-button" @click="saveSignature">
              <i class="fas fa-save"></i> Guardar Firma
            </button>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button class="cancel-button" @click="confirmReset">
          <i class="fas fa-times"></i> Cancelar
        </button>
        <button class="submit-button" @click="validateAndSave">
          <i class="fas fa-save"></i> Guardar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie'
import Swal from 'sweetalert2'
import apiService from "../../../service/apiService"
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import ArgonAutocomplete from '../../../components/ArgonAutocomplete.vue'
import { VueSignaturePad } from 'vue-signature-pad'

const originalConsoleError = console.error;
console.error = function(msg, ...args) {
  if (typeof msg === 'string' && msg.includes('ResizeObserver loop')) {
    return;
  }
  originalConsoleError(msg, ...args);
};

export default {
  name: 'MantenimientoForm',
  components: {
    ArgonAutocomplete,
    VueSignaturePad
  },
  data() {
    return {
      selectedRadicado: '',
      workOrder: null,
      assetInfo: null,
      maintenanceType: 'Preventivo',
      sparePartsStatus: 'No',
      orderState: true,
      workOrders: [],
      allOrders: [], // Almacenará todas las órdenes para buscar por radicado
      userId: null,
      wordOrdenId: null,
      showSignatureModal: false,
      modalWidth: window.innerWidth < 600 ? window.innerWidth - 40 : 560,
      validationErrors: {
        maintenanceType: '',
        workDescription: '',
        observations: '',
        sparePartsStatus: '',
        partsDetails: '',
        techSignature: ''
      },
      formData: {
        serialNumber: '',
        plateNumber: '',
        contactName: '',
        phone: '',
        location: '',
        startDate: '',
        endDate: '',
        trackingNumber: '',
        prioridad: '',
        workDescription: '',
        observations: '',
        partsDetails: '',
        executedBy: '',
        techSignature: '',
        radicado: ''
      }
    }
  },
  watch: {
    sparePartsStatus(newValue) {
      if (newValue === 'No' || newValue === 'No aplica') {
        this.formData.partsDetails = '';
        this.validationErrors.partsDetails = '';
      }
    }
  },
  methods: {
    // Método para optimizar la imagen antes de guardarla
    async optimizeImage(imageDataUrl, maxWidth = 600, maxHeight = 300, quality = 0.8) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          // Calcular nuevas dimensiones manteniendo la proporción
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
          
          // Crear canvas para redimensionar
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          // Dibujar imagen redimensionada
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir a formato base64 con calidad ajustada
          const optimizedImage = canvas.toDataURL('image/jpeg', quality);
          
          // Mostrar información de optimización en consola
          console.log('Optimización de imagen:');
          console.log('- Tamaño original:', Math.round(imageDataUrl.length / 1024), 'KB');
          console.log('- Tamaño optimizado:', Math.round(optimizedImage.length / 1024), 'KB');
          console.log('- Reducción:', Math.round((1 - optimizedImage.length / imageDataUrl.length) * 100), '%');
          
          resolve(optimizedImage);
        };
        img.src = imageDataUrl;
      });
    },
    
    // Métodos para la firma digital
    openSignatureModal() {
      this.showSignatureModal = true;
      // Dar tiempo para que el modal se renderice antes de inicializar el pad
      setTimeout(() => {
        if (this.$refs.signaturePad) {
          this.$refs.signaturePad.clearSignature();
        }
      }, 100);
    },
    
    clearSignature() {
      if (this.$refs.signaturePad) {
        this.$refs.signaturePad.clearSignature();
      }
    },
    
    async saveSignature() {
      if (this.$refs.signaturePad) {
        const { isEmpty } = this.$refs.signaturePad;
        
        if (!isEmpty()) {
          try {
            Swal.showLoading();
            
            // Obtener la firma como imagen
            const { data } = this.$refs.signaturePad.saveSignature();
            
            // Optimizar la firma antes de guardarla
            const optimizedSignature = await this.optimizeImage(data);
            
            // Guardar la firma optimizada
            this.formData.techSignature = optimizedSignature;
            this.showSignatureModal = false;
            this.validationErrors.techSignature = '';
            
            Swal.close();
          } catch (error) {
            console.error('Error al optimizar la firma:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo procesar la firma',
              confirmButtonColor: '#39a900'
            });
          }
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Firma vacía',
            text: 'Por favor, dibuje su firma antes de guardar',
            confirmButtonColor: '#39a900'
          });
        }
      }
    },
    
    cancelSignature() {
      this.showSignatureModal = false;
    },
    
    removeSignature() {
      this.formData.techSignature = '';
    },
    
    // Método para manejar la carga de imágenes con optimización
    async handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Verificar que sea una imagen
      if (!file.type.match('image.*')) {
        Swal.fire({
          icon: 'error',
          title: 'Tipo de archivo no válido',
          text: 'Por favor, seleccione un archivo de imagen',
          confirmButtonColor: '#39a900'
        });
        return;
      }
      
      // Verificar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo demasiado grande',
          text: 'La imagen debe ser menor a 5MB',
          confirmButtonColor: '#39a900'
        });
        return;
      }
      
      try {
        Swal.showLoading();
        
        // Leer el archivo como DataURL
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            // Optimizar la imagen antes de guardarla
            const optimizedImage = await this.optimizeImage(e.target.result);
            this.formData.techSignature = optimizedImage;
            this.validationErrors.techSignature = '';
            
            Swal.close();
          } catch (error) {
            console.error('Error al optimizar la imagen:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error al procesar la imagen',
              text: 'No se pudo optimizar la imagen',
              confirmButtonColor: '#39a900'
            });
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error al leer el archivo:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo leer el archivo',
          confirmButtonColor: '#39a900'
        });
      } finally {
        // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
        event.target.value = '';
      }
    },
    
    // Métodos existentes
    getUserData() {
      const authToken = Cookies.get('authToken');

      if (authToken) {
        try {
          const tokenParts = authToken.split('.');
          const payload = JSON.parse(atob(tokenParts[1])); 
          const userIdFromToken = payload.sub; 

          if (userIdFromToken) {
            this.userId = userIdFromToken; 

            apiService.get(`/users/${this.userId}`)
              .then(response => {
                if (response && response.name) {
                  this.formData.executedBy = response.name;
                }
              })
              .catch(error => {
                console.error('Error al obtener datos del usuario:', error);
              });
          }
        } catch (error) {
          console.error('Error al decodificar el token:', error);
        }
      }
    },
    
    async fetchData() {
      try {
        Swal.showLoading();
        
        await this.getUserData();
        
        const response = await apiService.get(`/word-orden`);
        
        this.allOrders = response;
        
        this.workOrders = response.map(orden => ({
          value: orden.radicado,
          subtitle: orden.solicitud.asset.name,
          title: `${orden.radicado} - ${orden.solicitud.serialNumber}`
        }));
        
        Swal.close();
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los datos',
          confirmButtonColor: '#39a900'
        });
      }
    },
    
    async handleWorkOrderSelect() {
      if (!this.selectedRadicado) return;
      
      try {
        Swal.showLoading();
        
        // Buscar la orden seleccionada en las órdenes ya cargadas
        const selectedOrder = this.allOrders.find(orden => orden.radicado === this.selectedRadicado);
        
        if (!selectedOrder) {
          throw new Error('Orden no encontrada');
        }
        
        // Guardar la orden completa y su ID
        this.workOrder = selectedOrder;
        this.wordOrdenId = selectedOrder._id;
        
        // Cargar información básica de la orden
        this.formData.radicado = selectedOrder.radicado || '';
        this.formData.prioridad = selectedOrder.prioridad || '';
        
        // Formatear fechas
        if (selectedOrder.fechaInicio) {
          this.formData.startDate = new Date(selectedOrder.fechaInicio).toISOString().split('T')[0];
        }
        
        if (selectedOrder.fechaFin) {
          this.formData.endDate = new Date(selectedOrder.fechaFin).toISOString().split('T')[0];
        }
        
        // Cargar información básica del activo si existe en la orden
        if (selectedOrder.asset) {
          this.formData.serialNumber = selectedOrder.asset.serialNumber || '';
        }
        
        // Cargar información de mantenimientos previos si existen
        if (selectedOrder.maintenances && selectedOrder.maintenances.length > 0) {
          const maintenance = selectedOrder.maintenances[0];
          this.formData.workDescription = maintenance.description || '';
        }
        
        // Si hay ID de solicitud, obtener detalles completos del activo y la solicitud
        if (selectedOrder.solicitud && selectedOrder.solicitud._id) {
          await this.fetchAssetInfo(selectedOrder.solicitud._id);
        } else {
          console.error("No se encontró el ID de la solicitud en la orden");
        }
        
        Swal.close();
      } catch (error) {
        console.error('Error al cargar información de la orden:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información de la orden',
          confirmButtonColor: '#39a900'
        });
      }
    },
    
    async fetchAssetInfo(solicitudId) {
      try {
        console.log("Consultando información del activo con ID de solicitud:", solicitudId);
        
        const response = await apiService.get(`/application-maintenance/Consultar/${solicitudId}`);
        console.log("Respuesta de la API:", response);
        
        // Guardar información de la solicitud
        if (response) {
          // Información del solicitante
          this.formData.contactName = response.requesterName || '';
          this.formData.phone = response.requesterPhone || '';
          this.formData.trackingNumber = response.trackingNumber || '';
          
          // Información del activo
          if (response.assetInfo) {
            this.assetInfo = response.assetInfo;
            
            // Mapear datos del activo a los campos del formulario
            this.formData.serialNumber = this.assetInfo.serialNumber || '';
            this.formData.plateNumber = this.assetInfo.inventoryCode || '';
            this.formData.location = this.assetInfo.location || '';
            
            console.log("Información del activo cargada correctamente");
          } else {
            console.error("No se encontró información del activo en la respuesta");
          }
        } else {
          console.error("Respuesta vacía de la API");
        }
      } catch (error) {
        console.error("Error al obtener la información del activo:", error);
      }
    },
    
    validateForm() {
      let isValid = true;
      
      // Limpiar errores anteriores
      Object.keys(this.validationErrors).forEach(key => this.validationErrors[key] = '');
      
      if (!this.maintenanceType) {
        this.validationErrors.maintenanceType = 'Seleccione un tipo de mantenimiento';
        isValid = false;
      }
      
      if (!this.formData.workDescription.trim()) {
        this.validationErrors.workDescription = 'La descripción es obligatoria';
        isValid = false;
      }
      
      if (!this.formData.observations.trim()) {
        this.validationErrors.observations = 'Las observaciones son obligatorias';
        isValid = false;
      }
      
      if (this.sparePartsStatus === 'Si' && !this.formData.partsDetails.trim()) {
        this.validationErrors.partsDetails = 'El detalle de repuestos es obligatorio';
        isValid = false;
      }
      
      if (!this.formData.techSignature) {
        this.validationErrors.techSignature = 'La firma es obligatoria';
        isValid = false;
      }
      
      return isValid;
    },
    
    validateAndSave() {
      if (this.validateForm()) {
        this.saveMaintenanceData();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: 'Complete todos los campos obligatorios',
          confirmButtonColor: '#39a900'
        });
      }
    },
    
    async saveMaintenanceData() {
      if (!this.selectedRadicado || !this.wordOrdenId) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Debe seleccionar una orden de trabajo',
          confirmButtonColor: '#39a900'
        });
        return;
      }
      
      try {
        Swal.showLoading();
        
        const maintenanceData = {
          typeMaintenance: this.maintenanceType,
          description: this.formData.workDescription,
          observation: this.formData.observations,
          sparePartsStatus: this.sparePartsStatus,
          sparePartsDetails: this.formData.partsDetails,
          technicalId: this.userId,
          wordOrdenId: this.wordOrdenId,
          technicalSignature: this.formData.techSignature,
          state: this.orderState
        };
        
        await apiService.post('/maintenance', maintenanceData);
        
        Swal.fire({
          icon: 'success',
          title: '¡Guardado exitoso!',
          text: 'Los datos se han guardado correctamente',
          confirmButtonColor: '#39a900'
        });
        
      } catch (error) {
        console.error('Error al guardar:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron guardar los datos',
          confirmButtonColor: '#39a900'
        });
      }
    },
    
    async generatePdfReport() {
      if (!this.selectedRadicado) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'Debe seleccionar una orden de trabajo para generar el informe',
          confirmButtonColor: '#39a900'
        });
        return;
      }
      
      try {
        Swal.showLoading();
        
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text('Orden de Trabajo', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Número: ${this.selectedRadicado}`, 20, 40);
        
        doc.autoTable({
          startY: 50,
          head: [['Campo', 'Valor']],
          body: [
            ['Número de serie', this.formData.serialNumber],
            ['Número de placa', this.formData.plateNumber],
            ['Fecha inicio', this.formData.startDate],
            ['Fecha fin', this.formData.endDate],
            ['Ubicación', this.formData.location],
            ['Contacto', this.formData.contactName],
            ['Teléfono', this.formData.phone],
            ['Tipo de mantenimiento', this.maintenanceType],
            ['Descripción', this.formData.workDescription],
            ['Observaciones', this.formData.observations],
            ['Repuestos requeridos', this.sparePartsStatus],
            ['Detalle de repuestos', this.formData.partsDetails],
            ['Estado', this.orderState ? 'Ejecutado' : 'Pendiente'],
            ['Ejecutado por', this.formData.executedBy],
            ['Firma técnico', 'Firmado digitalmente']
          ]
        });
        
        // Si hay firma, añadirla al PDF
        if (this.formData.techSignature) {
          try {
            // Añadir la firma como imagen
            doc.addPage();
            doc.setFontSize(16);
            doc.text('Firma del técnico:', 105, 20, { align: 'center' });
            doc.addImage(this.formData.techSignature, 'PNG', 20, 30, 170, 100);
          } catch (e) {
            console.error('Error al añadir la firma al PDF:', e);
          }
        }
        
        doc.save(`orden-trabajo-${this.selectedRadicado}.pdf`);
        
        Swal.fire({
          icon: 'success',
          title: 'PDF Generado',
          text: 'El informe se ha generado correctamente',
          confirmButtonColor: '#39a900'
        });
        
      } catch (error) {
        console.error('Error al generar PDF:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo generar el informe',
          confirmButtonColor: '#39a900'
        });
      }
    },
    
    confirmReset() {
      Swal.fire({
        title: '¿Está seguro?',
        text: "Se perderán los cambios no guardados",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#39a900',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, limpiar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.resetForm();
          Swal.fire({
            icon: 'success',
            title: 'Formulario limpiado',
            showConfirmButton: false,
            timer: 1500
          });
        }
      });
    },
    
    resetForm() {
      // Mantener radicado seleccionado pero limpiar campos de mantenimiento
      this.formData.workDescription = '';
      this.formData.observations = '';
      this.formData.partsDetails = '';
      this.formData.techSignature = '';
      this.maintenanceType = 'Preventivo';
      this.sparePartsStatus = 'No';
      this.orderState = true;
      
      // Limpiar errores
      Object.keys(this.validationErrors).forEach(key => this.validationErrors[key] = '');
    },
    
    handleResize() {
      this.modalWidth = window.innerWidth < 600 ? window.innerWidth - 40 : 560;
    }
  },
  mounted() {
    this.fetchData();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
}
</script>

<style scoped>
.search-container {
  display: flex;
  align-items: center;
  width: 50%;
}
.maintenance-form {
  max-width: 1200px;
  margin: 0 auto;
  padding:0 20px;
  position: relative;
  overflow: hidden;
  color: #333;
}

.background-watermark {
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

.form-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.order-number {
  font-size: 14px;
  color: #555;
  background-color: #f8f9fa;
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.title-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.main-title {
  font-size: 22px;
  color: #39A900;
  margin: 0;
  font-weight: 600;
}

.action-button {
  background: #39A900;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.action-button:hover {
  background: #2d8000;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: #555;
  margin-bottom: 6px;
  font-weight: 500;
}

.required {
  color: #dc3545;
  margin-left: 2px;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus, .form-textarea:focus {
  border-color: #39A900;
  outline: none;
}

.form-input[readonly] {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
}

.section-title {
  text-align: center;
  color: #39A900;
  font-size: 20px;
  margin: 0 0 24px;
  font-weight: 600;
}

.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 24px;
}

.checkbox-group {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #ced4da;
  transition: all 0.2s;
}

.checkbox-label.selected {
  background-color: #e8f5e9;
  color: #39A900;
  border-color: #39A900;
}

.bottom-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-button, .submit-button {
  padding: 8px 16px;
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

.submit-button {
  border: none;
  background-color: #39A900;
  color: white;
}

.cancel-button:hover {
  background-color: #f8f9fa;
}

.submit-button:hover {
  background-color: #2d8000;
}

/* Estilos para el componente de firma */
.signature-container {
  position: relative;
}

.signature-preview {
  position: relative;
  border: 1px solid #ced4da;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.signature-image {
  width: 100%;
  max-height: 150px;
  object-fit: contain;
  display: block;
}

.remove-signature-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #dc3545;
  font-size: 14px;
}

.signature-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.signature-button, .upload-button {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  background-color: #f8f9fa;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.signature-button:hover, .upload-button:hover {
  background-color: #e9ecef;
}

.signature-button.error, .upload-button.error {
  border-color: #dc3545;
}

.or-divider {
  text-align: center;
  color: #6c757d;
  font-size: 12px;
  margin: 4px 0;
}

.file-input {
  display: none;
}

/* Estilos del modal */
.signature-modal-backdrop {
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

.signature-modal {
  background-color: white;
  border-radius: 8px;
  width: 600px;
  max-width: 95%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.signature-modal-header {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.signature-modal-header h3 {
  margin: 0;
  color: #39a900;
  font-size: 18px;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
}

.signature-modal-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.signature-instructions {
  margin-top: 12px;
  color: #6c757d;
  font-size: 14px;
}

.signature-modal-footer {
  padding: 16px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.clear-button {
  border: 1px solid #ced4da;
  background-color: white;
  color: #555;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.clear-button:hover {
  background-color: #f8f9fa;
}

.save-button {
  border: none;
  background-color: #39a900;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.save-button:hover {
  background-color: #2d8500;
}

@media (max-width: 992px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .two-columns {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .bottom-row {
    grid-template-columns: 1fr;
  }

  .header-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .title-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .checkbox-group {
    flex-direction: column;
    gap: 8px;
  }
  
  .signature-modal-footer {
    flex-direction: column;
  }
  
  .cancel-button, .clear-button, .save-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-button, .submit-button {
    width: 100%;
  }
}
</style>