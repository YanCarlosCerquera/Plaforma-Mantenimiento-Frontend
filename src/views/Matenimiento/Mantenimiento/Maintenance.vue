<template>
  <div class="maintenance-form">
    <div class="background-watermark"></div>
    
    <!-- Loading overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    
    <!-- Progress tracker -->
    <div class="progress-tracker" v-if="selectedRadicado && !isLoading">
      <div class="progress-step" :class="{ 'active': currentStep >= 1, 'completed': currentStep > 1 }">
        <div class="step-number">1</div>
        <div class="step-label">Selección</div>
      </div>
      <div class="progress-line" :class="{ 'active': currentStep >= 2 }"></div>
      <div class="progress-step" :class="{ 'active': currentStep >= 2, 'completed': currentStep > 2 }">
        <div class="step-number">2</div>
        <div class="step-label">Mantenimiento</div>
      </div>
      <div class="progress-line" :class="{ 'active': currentStep >= 3 }"></div>
      <div class="progress-step" :class="{ 'active': currentStep >= 3, 'completed': currentStep > 3 }">
        <div class="step-number">3</div>
        <div class="step-label">Firma</div>
      </div>
      <div class="progress-line" :class="{ 'active': currentStep >= 4 }"></div>
      <div class="progress-step" :class="{ 'active': currentStep >= 4 }">
        <div class="step-number">4</div>
        <div class="step-label">Finalizar</div>
      </div>
    </div>
    
    <!-- Paso 1: Selección de orden -->
    <div class="form-section top-section" v-if="currentStep === 1">
      <div class="header-row">
        <div class="search-container" v-if="!autoSelectedOrder">
          <ArgonAutocomplete 
            placeholder="Buscar por radicado o activo..."
            :items="filteredWorkOrders"
            v-model="selectedRadicado"
            @update:modelValue="handleWorkOrderSelect"
            @input="handleSearchInput"
          />
        </div>
        <div class="search-container" v-else>
          <div class="auto-selected-order">
            <span>Orden seleccionada: </span>
            <strong>{{ selectedRadicado }}</strong>
            <button class="change-order-btn" @click="resetAutoSelectedOrder">
              <i class="fas fa-exchange-alt"></i> Cambiar
            </button>
          </div>
        </div>
        <div class="title-actions">
          <h2 class="main-title">Orden de Trabajo</h2>
          
          <div class="action-buttons">
            <button class="action-button secondary" @click="showAssetDetails = !showAssetDetails" v-if="selectedRadicado">
              <span>{{ showAssetDetails ? 'Ocultar detalles' : 'Ver detalles' }}</span>
              <i :class="showAssetDetails ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
            <button class="action-button" @click="generatePdfReport" :disabled="!selectedRadicado">
              <span>Realizar informe</span>
              <i class="fas fa-file-pdf"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="asset-details" v-if="showAssetDetails && selectedRadicado">
        <h3 class="details-title"><i class="fas fa-info-circle"></i> Detalles del activo</h3>
        <div class="details-grid">
          <div class="detail-item">
            <span class="detail-label">Marca:</span>
            <span class="detail-value">{{ assetInfo?.brand || 'No disponible' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Modelo:</span>
            <span class="detail-value">{{ assetInfo?.modelo || 'No disponible' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Tipo:</span>
            <span class="detail-value">{{ assetInfo?.equipmentType || 'No disponible' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Estado:</span>
            <span class="detail-value status-badge">
              {{ assetInfo?.status || 'No disponible' }}
            </span>
          </div>
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
      
      <div class="form-actions">
        <button class="cancel-button" @click="confirmReset">
          <i class="fas fa-times"></i> Cancelar
        </button>
        <button class="next-button" @click="goToNextStep">
          <i class="fas fa-arrow-right"></i> Siguiente
        </button>
      </div>
    </div>

    <!-- Paso 2: Trabajo realizado -->
    <div class="form-section bottom-section" v-if="currentStep === 2">
      <h2 class="section-title">Trabajo realizado</h2>

      <div class="two-columns">
        <div class="column">
          <div class="form-group">
            <label class="label-text">
              Mantenimiento realizado 
              <span class="required">*</span>
              <div class="tooltip">
                <i class="fas fa-info-circle"></i>
                <span class="tooltip-text">Seleccione el tipo de mantenimiento realizado</span>
              </div>
            </label>
            <div class="maintenance-type-selector">
              <label 
                class="maintenance-type-option" 
                :class="{ 'selected': maintenanceType === 'Preventivo' }"
                @click="maintenanceType = 'Preventivo'; validationErrors.maintenanceType = ''"
              >
                <input type="radio" name="maintenanceType" value="Preventivo" v-model="maintenanceType">
                <div class="option-icon"><i class="fas fa-shield-alt"></i></div>
                <div class="option-text">Preventivo</div>
              </label>
              <label 
                class="maintenance-type-option" 
                :class="{ 'selected': maintenanceType === 'Correctivo' }"
                @click="maintenanceType = 'Correctivo'; validationErrors.maintenanceType = ''"
              >
                <input type="radio" name="maintenanceType" value="Correctivo" v-model="maintenanceType">
                <div class="option-icon"><i class="fas fa-tools"></i></div>
                <div class="option-text">Correctivo</div>
              </label>
            </div>
            <span v-if="validationErrors.maintenanceType" class="error-message">
              {{ validationErrors.maintenanceType }}
            </span>
          </div>

          <div class="form-group">
            <label for="workDescription">
              Descripción del trabajo y/o servicio solicitado 
              <span class="required">*</span>
            </label>
            <div class="textarea-container">
              <textarea 
                id="workDescription" 
                v-model="formData.workDescription" 
                class="form-textarea" 
                rows="4"
                placeholder="Describa el trabajo realizado..."
                :class="{ 'error': validationErrors.workDescription }"
                @input="validationErrors.workDescription = ''"
              ></textarea>
              <div class="character-counter" :class="{ 'warning': formData.workDescription.length > 400 }">
                {{ formData.workDescription.length }}/500
              </div>
            </div>
            <span v-if="validationErrors.workDescription" class="error-message">
              {{ validationErrors.workDescription }}
            </span>
          </div>

          <div class="form-group">
            <label for="observations">
              Observaciones 
              <span class="required">*</span>
            </label>
            <div class="textarea-container">
              <textarea 
                id="observations" 
                v-model="formData.observations" 
                class="form-textarea" 
                rows="3"
                placeholder="Ingrese observaciones adicionales..."
                :class="{ 'error': validationErrors.observations }"
                @input="validationErrors.observations = ''"
              ></textarea>
              <div class="character-counter" :class="{ 'warning': formData.observations.length > 300 }">
                {{ formData.observations.length }}/400
              </div>
            </div>
            <span v-if="validationErrors.observations" class="error-message">
              {{ validationErrors.observations }}
            </span>
          </div>
        </div>

        <div class="column">
          <div class="form-group">
            <label class="label-text">
              Repuestos requeridos 
              <span class="required">*</span>
              <div class="tooltip">
                <i class="fas fa-info-circle"></i>
                <span class="tooltip-text">Indique si se requirieron repuestos para el mantenimiento</span>
              </div>
            </label>
            <div class="spare-parts-selector">
              <label 
                class="spare-parts-option" 
                :class="{ 'selected': sparePartsStatus === 'Si' }"
                @click="sparePartsStatus = 'Si'"
              >
                <input type="radio" name="sparePartsStatus" value="Si" v-model="sparePartsStatus">
                <div class="option-icon"><i class="fas fa-check-circle"></i></div>
                <div class="option-text">Si</div>
              </label>
              <label 
                class="spare-parts-option" 
                :class="{ 'selected': sparePartsStatus === 'No' }"
                @click="sparePartsStatus = 'No'"
              >
                <input type="radio" name="sparePartsStatus" value="No" v-model="sparePartsStatus">
                <div class="option-icon"><i class="fas fa-times-circle"></i></div>
                <div class="option-text">No</div>
              </label>
              <label 
                class="spare-parts-option" 
                :class="{ 'selected': sparePartsStatus === 'No aplica' }"
                @click="sparePartsStatus = 'No aplica'"
              >
                <input type="radio" name="sparePartsStatus" value="No aplica" v-model="sparePartsStatus">
                <div class="option-icon"><i class="fas fa-minus-circle"></i></div>
                <div class="option-text">No aplica</div>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="partsDetails">
              Detalle de repuestos 
              <span v-if="sparePartsStatus === 'Si'" class="required">*</span>
            </label>
            <div class="textarea-container">
              <textarea 
                id="partsDetails" 
                v-model="formData.partsDetails" 
                class="form-textarea" 
                rows="4"
                placeholder="Detalle los repuestos utilizados..."
                :disabled="sparePartsStatus === 'No' || sparePartsStatus === 'No aplica'"
                :class="{ 'error': validationErrors.partsDetails }"
                @input="validationErrors.partsDetails = ''"
              ></textarea>
              <div v-if="sparePartsStatus === 'Si'" class="character-counter" :class="{ 'warning': formData.partsDetails.length > 300 }">
                {{ formData.partsDetails.length }}/400
              </div>
            </div>
            <span v-if="validationErrors.partsDetails" class="error-message">
              {{ validationErrors.partsDetails }}
            </span>
          </div>
          
          <div class="form-group">
            <label class="label-text">Tiempo estimado de mantenimiento</label>
            <div class="time-estimate-container">
              <div class="time-display">{{ formattedTimeEstimate }}</div>
              <div class="time-controls">
                <button type="button" class="time-button" @click="decreaseTime">
                  <i class="fas fa-minus"></i>
                </button>
                <input 
                  type="range" 
                  v-model="timeEstimate" 
                  min="1" 
                  max="24" 
                  step="0.5" 
                  class="time-slider"
                >
                <button type="button" class="time-button" @click="increaseTime">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-row">
        <div class="form-group">
          <label class="label-text">
            Estado Orden de trabajo 
            <span class="required">*</span>
            <div class="tooltip">
              <i class="fas fa-info-circle"></i>
              <span class="tooltip-text">Indique si la orden ha sido ejecutada o está pendiente</span>
            </div>
          </label>
          <div class="order-state-selector">
            <label 
              class="order-state-option" 
              :class="{ 'selected': orderState }"
              @click="orderState = true"
            >
              <input type="radio" name="orderState" :value="true" v-model="orderState">
              <div class="option-icon"><i class="fas fa-check"></i></div>
              <div class="option-text">Ejecutado</div>
            </label>
            <label 
              class="order-state-option" 
              :class="{ 'selected': orderState === false }"
              @click="orderState = false"
            >
              <input type="radio" name="orderState" :value="false" v-model="orderState">
              <div class="option-icon"><i class="fas fa-clock"></i></div>
              <div class="option-text">Pendiente</div>
            </label>
          </div>
        </div>
        <div class="form-group">
          <label for="executedBy">Ejecutado por:</label>
          <input type="text" id="executedBy" v-model="formData.executedBy" class="form-input" readonly>
        </div>
      </div>
      
      <div class="form-actions">
        <button class="cancel-button" @click="confirmReset">
          <i class="fas fa-times"></i> Cancelar
        </button>
        <button class="prev-button" @click="currentStep = 1">
          <i class="fas fa-arrow-left"></i> Anterior
        </button>
        <button class="next-button" @click="goToNextStep">
          <i class="fas fa-arrow-right"></i> Siguiente
        </button>
      </div>
    </div>
    
    <!-- Paso 3: Firma -->
    <div class="form-section bottom-section" v-if="currentStep === 3">
      <h2 class="section-title">Firma del técnico</h2>
      
      <div class="form-group">
        <label for="techSignature">
          Firma técnico 
          <span class="required">*</span>
          <div class="tooltip">
            <i class="fas fa-info-circle"></i>
            <span class="tooltip-text">Dibuje o cargue una imagen de su firma</span>
          </div>
        </label>
        <div class="signature-container" :class="{ 'error-container': validationErrors.techSignature }">
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
      
      <div class="form-actions">
        <button class="cancel-button" @click="confirmReset">
          <i class="fas fa-times"></i> Cancelar
        </button>
        <button class="prev-button" @click="currentStep = 2">
          <i class="fas fa-arrow-left"></i> Anterior
        </button>
        <button class="next-button" @click="goToNextStep">
          <i class="fas fa-arrow-right"></i> Siguiente
        </button>
      </div>
    </div>
    
    <!-- Paso 4: Finalizar -->
    <div class="form-section bottom-section" v-if="currentStep === 4">
      <h2 class="section-title">Resumen y confirmación</h2>
      
      <div class="summary-container">
        <div class="summary-section">
          <h3 class="summary-title">Información de la orden</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Radicado:</span>
              <span class="summary-value">{{ selectedRadicado }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Serie:</span>
              <span class="summary-value">{{ formData.serialNumber }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Ubicación:</span>
              <span class="summary-value">{{ formData.location }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Estado:</span>
              <span class="summary-value">{{ orderState ? 'Ejecutado' : 'Pendiente' }}</span>
            </div>
          </div>
        </div>
        
        <div class="summary-section">
          <h3 class="summary-title">Detalles del mantenimiento</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Tipo:</span>
              <span class="summary-value">{{ maintenanceType }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Tiempo estimado:</span>
              <span class="summary-value">{{ formattedTimeEstimate }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Repuestos:</span>
              <span class="summary-value">{{ sparePartsStatus }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Técnico:</span>
              <span class="summary-value">{{ formData.executedBy }}</span>
            </div>
          </div>
        </div>
        
        <div class="summary-section">
          <h3 class="summary-title">Descripción del trabajo</h3>
          <div class="summary-text">{{ formData.workDescription }}</div>
        </div>
        
        <div class="summary-section">
          <h3 class="summary-title">Observaciones</h3>
          <div class="summary-text">{{ formData.observations }}</div>
        </div>
        
        <div class="summary-section" v-if="sparePartsStatus === 'Si'">
          <h3 class="summary-title">Detalle de repuestos</h3>
          <div class="summary-text">{{ formData.partsDetails }}</div>
        </div>
        
        <div class="summary-section">
          <h3 class="summary-title">Firma</h3>
          <div class="signature-summary">
            <img v-if="formData.techSignature" :src="formData.techSignature" alt="Firma" class="signature-image-small" />
            <div v-else class="no-signature">No se ha proporcionado firma</div>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button class="cancel-button" @click="confirmReset">
          <i class="fas fa-times"></i> Cancelar
        </button>
        <button class="prev-button" @click="currentStep = 3">
          <i class="fas fa-arrow-left"></i> Anterior
        </button>
        <button class="submit-button" @click="validateAndSave" :disabled="isLoading">
          <i class="fas fa-save"></i> Guardar
        </button>
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
          <div class="signature-controls">
            <div class="pen-color-selector">
              <span>Color: </span>
              <button 
                v-for="color in penColors" 
                :key="color.value" 
                class="color-option" 
                :style="{ backgroundColor: color.value }"
                :class="{ 'selected': currentPenColor === color.value }"
                @click="changePenColor(color.value)"
              ></button>
            </div>
            <div class="pen-size-selector">
              <span>Grosor: </span>
              <input 
                type="range" 
                v-model="penSize" 
                min="1" 
                max="5" 
                step="0.5" 
                class="pen-size-slider"
                @input="changePenSize"
              >
            </div>
          </div>
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
    
    <!-- Mensaje de no hay órdenes -->
    <div v-if="showNoOrdersMessage" class="no-orders-message">
      <i class="fas fa-info-circle"></i>
      <p>No hay órdenes de trabajo disponibles. Contacte al administrador.</p>
    </div>
    
    <!-- Notificación de guardado exitoso -->
    <div v-if="showSuccessNotification" class="success-notification">
      <div class="notification-content">
        <i class="fas fa-check-circle"></i>
        <div class="notification-text">
          <h4>¡Guardado exitoso!</h4>
          <p>Los datos se han guardado correctamente.</p>
        </div>
        <button @click="showSuccessNotification = false" class="close-notification">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="notification-actions">
        <button @click="realizarInformeInstante" class="notification-button">
          <i class="fas fa-file-alt"></i> Desear realizar el Informe al instante
        </button>
        <button @click="resetForm(); showSuccessNotification = false" class="notification-button">
          <i class="fas fa-plus"></i> Nuevo mantenimiento
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie'
import Swal from 'sweetalert2'
import apiService from "../../../service/apiservice"
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import ArgonAutocomplete from '../../../components/ArgonAutocomplete.vue'
import { VueSignaturePad } from 'vue-signature-pad'
import { debounce } from 'lodash'
import { useRouter } from 'vue-router'

// Solución para el error de ResizeObserver
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
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      selectedRadicado: '',
      searchQuery: '',
      workOrder: null,
      assetInfo: null,
      maintenanceType: 'Preventivo',
      sparePartsStatus: 'No',
      orderState: true,
      workOrders: [],
      filteredWorkOrders: [],
      allOrders: [], // Almacenará todas las órdenes para buscar por radicado
      userId: null,
      wordOrdenId: null,
      showSignatureModal: false,
      modalWidth: window.innerWidth < 600 ? window.innerWidth - 40 : 560,
      isLoading: false,
      showNoOrdersMessage: false,
      autoSelectedOrder: false, // Indica si la orden fue seleccionada automáticamente
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
      },
      // Nuevas propiedades
      currentStep: 1,
      showAssetDetails: false,
      timeEstimate: 2, // Horas estimadas por defecto
      showSuccessNotification: false,
      penColors: [
        { name: 'Verde', value: 'rgb(57, 169, 0)' },
        { name: 'Azul', value: 'rgb(0, 123, 255)' },
        { name: 'Negro', value: 'rgb(0, 0, 0)' }
      ],
      currentPenColor: 'rgb(57, 169, 0)',
      penSize: 2
    }
  },
  computed: {
    formattedTimeEstimate() {
      const hours = Math.floor(this.timeEstimate);
      const minutes = (this.timeEstimate - hours) * 60;
      
      if (minutes === 0) {
        return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
      } else {
        return `${hours} ${hours === 1 ? 'hora' : 'horas'} y ${minutes} minutos`;
      }
    },
    // Reemplaza tu función getStatusClass actual con esta versión:
    getStatusClass(status) {
      if (!status || typeof status !== 'string') return ''; // Verifica que status sea una cadena

      const statusLower = status.toLowerCase();
      if (statusLower.includes('activo') || statusLower.includes('bueno')) {
        return 'status-active';
      } else if (statusLower.includes('reparación') || statusLower.includes('mantenimiento')) {
        return 'status-maintenance';
      } else if (statusLower.includes('baja') || statusLower.includes('malo')) {
        return 'status-inactive';
      }

      return '';
    }
  },
  watch: {
    sparePartsStatus(newValue) {
      if (newValue === 'No' || newValue === 'No aplica') {
        this.formData.partsDetails = '';
        this.validationErrors.partsDetails = '';
      }
    },
    selectedRadicado(newValue) {
      if (newValue) {
        this.currentStep = 1;
      }
    }
  },
  created() {
    // Crear versión con debounce de la función de búsqueda
    this.debouncedSearch = debounce(this.performSearch, 300);
  },
  methods: {
    // Nuevos métodos
    goToNextStep() {
      // Validar el paso actual antes de avanzar
      if (this.currentStep === 1) {
        if (!this.selectedRadicado) {
          Swal.fire({
            icon: 'warning',
            title: 'Selección requerida',
            text: 'Debe seleccionar una orden de trabajo para continuar',
            confirmButtonColor: '#39a900'
          });
          return;
        }
        this.currentStep = 2;
      } else if (this.currentStep === 2) {
        // Validar campos de mantenimiento
        if (!this.maintenanceType) {
          this.validationErrors.maintenanceType = 'Seleccione un tipo de mantenimiento';
          return;
        }
        if (!this.formData.workDescription.trim()) {
          this.validationErrors.workDescription = 'La descripción es obligatoria';
          return;
        }
        if (!this.formData.observations.trim()) {
          this.validationErrors.observations = 'Las observaciones son obligatorias';
          return;
        }
        if (this.sparePartsStatus === 'Si' && !this.formData.partsDetails.trim()) {
          this.validationErrors.partsDetails = 'El detalle de repuestos es obligatorio';
          return;
        }
        
        this.currentStep = 3;
      } else if (this.currentStep === 3) {
        // Validar firma
        if (!this.formData.techSignature) {
          this.validationErrors.techSignature = 'La firma es obligatoria';
          return;
        }
        
        this.currentStep = 4;
      }
    },
    
    decreaseTime() {
      if (this.timeEstimate > 1) {
        this.timeEstimate -= 0.5;
      }
    },
    
    increaseTime() {
      if (this.timeEstimate < 24) {
        this.timeEstimate += 0.5;
      }
    },
    
    changePenColor(color) {
      this.currentPenColor = color;
      if (this.$refs.signaturePad) {
        this.$refs.signaturePad.options.penColor = color;
      }
    },
    
    changePenSize() {
      if (this.$refs.signaturePad) {
        this.$refs.signaturePad.options.minWidth = this.penSize;
        this.$refs.signaturePad.options.maxWidth = this.penSize * 2;
      }
    },
    
    realizarInformeInstante() {
      // Guardar ID de la orden en cookie y redirigir a la página de informes
      Cookies.set('OrdenId', this.wordOrdenId, { expires: 1 });
      this.router.push('/RealizarInforme');
    },
    
    // Método para manejar la entrada de búsqueda
    handleSearchInput(event) {
      this.searchQuery = event.target.value;
      this.debouncedSearch(this.searchQuery);
    },
    
    // Método para realizar la búsqueda
    performSearch(query) {
      if (!query) {
        this.filteredWorkOrders = this.workOrders;
        return;
      }
      
      const lowerQuery = query.toLowerCase();
      this.filteredWorkOrders = this.allOrders
        .filter(orden => 
          orden && 
          (orden.radicado.toLowerCase().includes(lowerQuery) || 
           (orden.solicitud?.asset?.name && orden.solicitud.asset.name.toLowerCase().includes(lowerQuery)))
        )
        .map(orden => ({
          value: orden.radicado,
          subtitle: orden.solicitud?.asset?.name || '',
          title: `${orden.radicado} - ${orden.solicitud?.serialNumber || ''}`
        }));
    },
    
    // Método para manejar errores de API de forma consistente
    handleApiError(error, customMessage = 'Error en la operación') {
      console.error(customMessage, error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `${customMessage}: ${errorMessage}`,
        confirmButtonColor: '#39a900'
      });
    },
    
    // Método para gestionar el estado de carga
    setLoading(status) {
      this.isLoading = status;
      if (status) {
        Swal.showLoading();
      } else {
        Swal.close();
      }
    },
    
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
          this.changePenColor(this.currentPenColor);
          this.changePenSize();
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
            this.setLoading(true);
            
            // Obtener la firma como imagen
            const { data } = this.$refs.signaturePad.saveSignature();
            
            // Optimizar la firma antes de guardarla
            const optimizedSignature = await this.optimizeImage(data);
            
            // Guardar la firma optimizada
            this.formData.techSignature = optimizedSignature;
            this.showSignatureModal = false;
            this.validationErrors.techSignature = '';
            
            this.setLoading(false);
          } catch (error) {
            this.handleApiError(error, 'Error al optimizar la firma');
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
    
handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Verificar que sea una imagen
  if (!file.type.match('image.*')) {
    Swal.fire({
      icon: 'error',
      title: 'Tipo de archivo no válido',
      text: 'Por favor, seleccione un archivo de imagen',
      confirmButtonColor: '#39a900',
    });
    return;
  }

  // Verificar tamaño (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    Swal.fire({
      icon: 'error',
      title: 'Archivo demasiado grande',
      text: 'La imagen debe ser menor a 5MB',
      confirmButtonColor: '#39a900',
    });
    return;
  }

  try {
    this.setLoading(true);

    // Leer el archivo como DataURL
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Dimensiones máximas
          const maxWidth = 800;
          const maxHeight = 800;

          let width = img.width;
          let height = img.height;

          // Redimensionar la imagen manteniendo la relación de aspecto
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Dibujar la imagen redimensionada en el canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Convertir la imagen a WebP con calidad del 80%
          const compressedImage = canvas.toDataURL('image/webp', 0.8);

          // Asignar la imagen comprimida al estado
          this.formData.techSignature = compressedImage;
          this.validationErrors.techSignature = '';

          this.setLoading(false);
        };
      } catch (error) {
        this.handleApiError(error, 'Error al optimizar la imagen');
      }
    };
    reader.readAsDataURL(file);
  } catch (error) {
    this.handleApiError(error, 'Error al leer el archivo');
  } finally {
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    event.target.value = '';
  }
},
    
    // Método para resetear la orden seleccionada automáticamente
    resetAutoSelectedOrder() {
      this.autoSelectedOrder = false;
      this.selectedRadicado = '';
      this.resetForm();
      
      // Eliminar la cookie de OrdenId
      Cookies.remove('OrdenId');
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
        this.setLoading(true);
        
        await this.getUserData();
        
        // Verificar si hay una orden seleccionada desde el componente de ejecuciones
        const ordenId = Cookies.get('OrdenId');
        
        // Cargar todas las órdenes primero
        const response = await apiService.get(`/word-orden`);
        
        if (!response || response.length === 0) {
          this.showNoOrdersMessage = true;
          this.setLoading(false);
          return;
        }
        
        this.allOrders = response;
        
        // Filtrar órdenes válidas para evitar errores
        this.workOrders = response
          .filter(orden => orden && orden.radicado && orden.solicitud && orden.solicitud.asset)
          .map(orden => ({
            value: orden.radicado,
            subtitle: orden.solicitud.asset.name,
            title: `${orden.radicado} - ${orden.solicitud.serialNumber}`
          }));
        
        this.filteredWorkOrders = [...this.workOrders];
        
        // Si hay una orden seleccionada desde el componente de ejecuciones, cargarla
        if (ordenId) {
          
          // Buscar la orden en las órdenes cargadas
          const selectedOrder = this.allOrders.find(orden => orden._id === ordenId);
          
          if (selectedOrder) {
            this.autoSelectedOrder = true;
            this.selectedRadicado = selectedOrder.radicado;
            await this.loadWorkOrderDetails(selectedOrder);
          } else {
            console.error("No se encontró la orden con ID:", ordenId);
            // Intentar cargar directamente por ID
            try {
              const orderDetails = await apiService.get(`/word-orden/${ordenId}`);
              if (orderDetails) {
                this.autoSelectedOrder = true;
                this.selectedRadicado = orderDetails.radicado;
                await this.loadWorkOrderDetails(orderDetails);
              }
            } catch (error) {
              console.error("Error al cargar la orden por ID:", error);
            }
          }
        }
        
        this.setLoading(false);
      } catch (error) {
        this.handleApiError(error, 'No se pudieron cargar los datos');
        this.showNoOrdersMessage = true;
      }
    },
    
    // Método para cargar los detalles de una orden de trabajo
    async loadWorkOrderDetails(selectedOrder) {
      try {
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
        
        // Establecer el estado de la orden
        this.orderState = selectedOrder.state;
        
        // Cargar información del técnico
        if (selectedOrder.tecnicoId && selectedOrder.tecnicoId.name) {
          this.formData.executedBy = selectedOrder.tecnicoId.name;
        }
        
        // Cargar información de la solicitud si existe
        if (selectedOrder.solicitud) {
          // Información del activo
          if (selectedOrder.solicitud.asset) {
            this.formData.serialNumber = selectedOrder.solicitud.serialNumber || '';
            this.formData.location = selectedOrder.solicitud.asset.location || '';
          }
          
          // Información del tipo de mantenimiento
          if (selectedOrder.solicitud.maintenanceType) {
            this.maintenanceType = selectedOrder.solicitud.maintenanceType;
          }
          
          // Número de seguimiento
          this.formData.trackingNumber = selectedOrder.solicitud.trackingNumber || '';
        }
        
        // Si hay ID de solicitud, obtener detalles completos del activo y la solicitud
        if (selectedOrder.solicitud && selectedOrder.solicitud._id) {
          await this.fetchAssetInfo(selectedOrder.solicitud._id);
        }
        
        // Cargar mantenimientos previos si existen
        if (selectedOrder.maintenances && selectedOrder.maintenances.length > 0) {
          const lastMaintenance = selectedOrder.maintenances[selectedOrder.maintenances.length - 1];
          this.formData.workDescription = lastMaintenance.description || '';
          this.formData.observations = lastMaintenance.observation || '';
          this.sparePartsStatus = lastMaintenance.sparePartsStatus || 'No';
          this.formData.partsDetails = lastMaintenance.sparePartsDetails || '';
          this.formData.techSignature = lastMaintenance.technicalSignature || '';
        }
        
      } catch (error) {
        this.handleApiError(error, 'Error al cargar información de la orden');
      }
    },
    
    async handleWorkOrderSelect() {
      if (!this.selectedRadicado) return;
      
      try {
        this.setLoading(true);
        
        // Buscar la orden seleccionada en las órdenes ya cargadas
        const selectedOrder = this.allOrders.find(orden => orden.radicado === this.selectedRadicado);
        
        if (!selectedOrder) {
          throw new Error('Orden no encontrada');
        }
        
        await this.loadWorkOrderDetails(selectedOrder);
        
        this.setLoading(false);
      } catch (error) {
        this.handleApiError(error, 'Error al cargar información de la orden');
      }
    },
    
    async fetchAssetInfo(solicitudId) {
      try {
        
        const response = await apiService.get(`/application-maintenance/Consultar/${solicitudId}`);
        
        // Guardar información de la solicitud
        if (response) {
          // Información del solicitante
          this.formData.contactName = response.requesterName || '';
          this.formData.phone = response.requesterPhone || '';
          
          // Información del activo
          if (response.assetInfo) {
            this.assetInfo = response.assetInfo;
            
            // Mapear datos del activo a los campos del formulario
            this.formData.serialNumber = this.assetInfo.serialNumber || '';
            this.formData.plateNumber = this.assetInfo.inventoryCode || '';
            this.formData.location = this.assetInfo.location || '';
            
          }
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
      
      // Añadir confirmación si se está cambiando el estado a ejecutado
      if (this.orderState === true && this.workOrder && this.workOrder.state === false) {
        const result = await Swal.fire({
          icon: 'warning',
          title: 'Confirmar cambio de estado',
          text: '¿Está seguro de marcar esta orden como ejecutada? Esta acción no se puede deshacer.',
          showCancelButton: true,
          confirmButtonColor: '#39a900',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, confirmar',
          cancelButtonText: 'Cancelar'
        });
        
        if (!result.isConfirmed) {
          return;
        }
      }
      
      try {
        this.setLoading(true);
        
        const maintenanceData = {
          typeMaintenance: this.maintenanceType,
          description: this.formData.workDescription,
          observation: this.formData.observations,
          sparePartsStatus: this.sparePartsStatus,
          sparePartsDetails: this.sparePartsStatus === 'Si' ? this.formData.partsDetails : '',
          technicalId: this.userId,
          wordOrdenId: this.wordOrdenId,
          technicalSignature: this.formData.techSignature,
          state: this.orderState,
          timeEstimate: this.timeEstimate // Nuevo campo para tiempo estimado
        };
        
        // Log the data being sent for debugging
        console.log('Enviando datos de mantenimiento:', JSON.stringify(maintenanceData, null, 2));
        
        await apiService.post('/maintenance', maintenanceData);
        
        // Actualizar datos locales para reflejar el cambio
        const updatedOrder = this.allOrders.find(order => order._id === this.wordOrdenId);
        if (updatedOrder) {
          updatedOrder.state = this.orderState;
        }
        
        // Si la orden fue seleccionada automáticamente, eliminar la cookie
        if (this.autoSelectedOrder) {
          Cookies.remove('OrdenId');
        }
        
        this.setLoading(false);
        
        // Mostrar notificación de éxito
        this.showSuccessNotification = true;
        
        // Preparar cookie para informe si se desea crear uno
        Cookies.set('LastMaintenanceId', this.wordOrdenId, { expires: 1 });
        
      } catch (error) {
        this.handleApiError(error, 'No se pudieron guardar los datos');
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
        this.setLoading(true);
        
        const doc = new jsPDF();
        
        // Añadir encabezado
        doc.setFontSize(20);
        doc.text('Orden de Trabajo', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Número: ${this.selectedRadicado}`, 20, 40);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 50);
        
        // Tabla de información general
        doc.autoTable({
          startY: 60,
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
            ['Tiempo estimado', this.formattedTimeEstimate]
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
        
        this.setLoading(false);
        
        // Preguntar si desea crear un informe completo
        Swal.fire({
          icon: 'success',
          title: 'PDF Generado',
          text: 'El informe básico se ha generado correctamente. ¿Desea crear un informe completo?',
          showCancelButton: true,
          confirmButtonColor: '#39a900',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Crear informe completo',
          cancelButtonText: 'No, gracias'
        }).then((result) => {
          if (result.isConfirmed) {
            // Guardar ID de la orden en cookie y redirigir a la página de informes
            Cookies.set('OrdenId', this.wordOrdenId, { expires: 1 });
            this.router.push('/RealizarInforme');
          }
        });
        
      } catch (error) {
        this.handleApiError(error, 'No se pudo generar el informe');
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
      this.timeEstimate = 2;
      this.currentStep = 1;
      
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
.maintenance-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
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

/* Progress tracker */
.progress-tracker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0 30px;
  padding: 0 20px;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.step-label {
  font-size: 14px;
  color: #6c757d;
  transition: all 0.3s;
}

.progress-line {
  flex: 1;
  height: 3px;
  background-color: #e9ecef;
  margin: 0 10px;
  position: relative;
  top: -18px;
  transition: all 0.3s;
}

.progress-step.active .step-number {
  background-color: #39a900;
  color: white;
}

.progress-step.active .step-label {
  color: #39a900;
  font-weight: 500;
}

.progress-step.completed .step-number {
  background-color: #28a745;
  color: white;
}

.progress-line.active {
  background-color: #39a900;
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

.search-container {
  display: flex;
  align-items: center;
  width: 50%;
}

/* Estilos para la orden seleccionada automáticamente */
.auto-selected-order {
  display: flex;
  align-items: center;
  background-color: #e8f5e9;
  border: 1px solid #39A900;
  border-radius: 6px;
  padding: 10px 16px;
  width: 100%;
}

.auto-selected-order strong {
  margin: 0 8px;
  color: #39A900;
}

.change-order-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: #39A900;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.change-order-btn:hover {
  text-decoration: underline;
}

.title-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-buttons {
  display: flex;
  gap: 10px;
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

.action-button.secondary {
  background: transparent;
  border: 1px solid #39A900;
  color: #39A900;
}

.action-button:hover {
  background: #2d8000;
}

.action-button.secondary:hover {
  background: #e8f5e9;
}

.action-button:disabled {
  background: #a0d8a0;
  cursor: not-allowed;
}

/* Detalles del activo */
.asset-details {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
}

.details-title {
  font-size: 16px;
  color: #39A900;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: #6c757d;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status-active {
  background-color: #e8f5e9;
  color: #28a745;
}

.status-maintenance {
  background-color: #fff3e0;
  color: #fd7e14;
}

.status-inactive {
  background-color: #ffebee;
  color: #dc3545;
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
  transition: all 0.2s;
}

.form-input:focus, .form-textarea:focus {
  border-color: #39A900;
  outline: none;
  box-shadow: 0 0 0 3px rgba(57, 169, 0, 0.2);
}

.form-input[readonly] {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.textarea-container {
  position: relative;
}

.character-counter {
  position: absolute;
  bottom: 5px;
  right: 10px;
  font-size: 12px;
  color: #6c757d;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 2px 5px;
  border-radius: 3px;
}

.character-counter.warning {
  color: #fd7e14;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  padding-bottom: 25px;
}

.error {
  border-color: #dc3545 !important;
}

.error-container {
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

/* Selector de tipo de mantenimiento */
.maintenance-type-selector {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.maintenance-type-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #ced4da;
  cursor: pointer;
  transition: all 0.2s;
}

.maintenance-type-option input {
  display: none;
}

.maintenance-type-option .option-icon {
  font-size: 20px;
  color: #6c757d;
}

.maintenance-type-option .option-text {
  font-size: 14px;
  color: #555;
}

.maintenance-type-option.selected {
  background-color: #e8f5e9;
  border-color: #39A900;
}

.maintenance-type-option.selected .option-icon,
.maintenance-type-option.selected .option-text {
  color: #39A900;
}

/* Selector de repuestos */
.spare-parts-selector {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.spare-parts-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #ced4da;
  cursor: pointer;
  transition: all 0.2s;
}

.spare-parts-option input {
  display: none;
}

.spare-parts-option .option-icon {
  font-size: 20px;
  color: #6c757d;
}

.spare-parts-option .option-text {
  font-size: 14px;
  color: #555;
}

.spare-parts-option.selected {
  background-color: #e8f5e9;
  border-color: #39A900;
}

.spare-parts-option.selected .option-icon,
.spare-parts-option.selected .option-text {
  color: #39A900;
}

/* Selector de estado de orden */
.order-state-selector {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.order-state-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #ced4da;
  cursor: pointer;
  transition: all 0.2s;
}

.order-state-option input {
  display: none;
}

.order-state-option .option-icon {
  font-size: 20px;
  color: #6c757d;
}

.order-state-option .option-text {
  font-size: 14px;
  color: #555;
}

.order-state-option.selected {
  background-color: #e8f5e9;
  border-color: #39A900;
}

.order-state-option.selected .option-icon,
.order-state-option.selected .option-text {
  color: #39A900;
}

/* Estimador de tiempo */
.time-estimate-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #ced4da;
  background-color: #f8f9fa;
}

.time-display {
  font-size: 16px;
  font-weight: 500;
  color: #39A900;
  text-align: center;
}

.time-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #ced4da;
  border-radius: 3px;
  outline: none;
}

.time-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #39A900;
  cursor: pointer;
}

.time-button {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #ced4da;
  background-color: white;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.time-button:hover {
  background-color: #e9ecef;
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

.cancel-button, .prev-button, .next-button, .submit-button {
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

.prev-button {
  border: 1px solid #39A900;
  background-color: white;
  color: #39A900;
}

.next-button {
  border: none;
  background-color: #39A900;
  color: white;
}

.submit-button {
  border: none;
  background-color: #39A900;
  color: white;
}

.cancel-button:hover {
  background-color: #f8f9fa;
}

.prev-button:hover {
  background-color: #e8f5e9;
}

.next-button:hover, .submit-button:hover {
  background-color: #2d8000;
}

.submit-button:disabled {
  background-color: #a0d8a0;
  cursor: not-allowed;
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

/* Estilos para el componente de firma */
.signature-container {
  position: relative;
  border: 2px dashed #ced4da;
  border-radius: 4px;
  padding: 10px;
  transition: all 0.2s;
}

.signature-container:hover {
  border-color: #39A900;
}

.signature-preview {
  position: relative;
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

.signature-controls {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
  margin-top: 16px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.pen-color-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-option {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
}

.color-option.selected {
  border-color: #333;
}

.pen-size-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pen-size-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #ced4da;
  border-radius: 3px;
  outline: none;
}

.pen-size-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #39A900;
  cursor: pointer;
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

/* Estilos para el resumen */
.summary-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.summary-section {
  margin-bottom: 24px;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 16px;
}

.summary-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.summary-title {
  font-size: 16px;
  color: #39a900;
  margin: 0 0 16px 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 12px;
  color: #6c757d;
}

.summary-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.summary-text {
  background-color: white;
  border-radius: 4px;
  padding: 12px;
  font-size: 14px;
  color: #333;
  border: 1px solid #e9ecef;
  white-space: pre-wrap;
}

.signature-summary {
  display: flex;
  justify-content: center;
  padding: 16px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.signature-image-small {
  max-width: 100%;
  max-height: 100px;
  object-fit: contain;
}

.no-signature {
  color: #6c757d;
  font-style: italic;
  padding: 16px;
}

/* Mensaje de no hay órdenes */
.no-orders-message {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  margin-top: 20px;
}

.no-orders-message i {
  font-size: 24px;
  color: #6c757d;
  margin-bottom: 12px;
}

.no-orders-message p {
  color: #6c757d;
  font-size: 16px;
  margin: 0;
}

/* Notificación de éxito */
.success-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 300px;
  overflow: hidden;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
}

.notification-content i {
  font-size: 24px;
  color: #28a745;
  margin-right: 12px;
}

.notification-text {
  flex: 1;
}

.notification-text h4 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 16px;
}

.notification-text p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.close-notification {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 16px;
}

.notification-actions {
  display: flex;
  padding: 12px;
  gap: 8px;
}

.notification-button {
  flex: 1;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: white;
  color: #555;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.notification-button:hover {
  background-color: #f8f9fa;
}

@media (max-width: 992px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .details-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .progress-tracker {
    overflow-x: auto;
    padding-bottom: 10px;
  }
  
  .search-container {
    width: 100%;
  }
  
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
    margin-top: 10px;
  }
  
  .maintenance-type-selector,
  .spare-parts-selector {
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
  
  .cancel-button, .prev-button, .next-button, .submit-button {
    width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .action-button {
    width: 100%;
  }
}
</style>