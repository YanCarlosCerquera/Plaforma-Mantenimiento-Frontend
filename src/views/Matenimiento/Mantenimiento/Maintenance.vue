<template>
  <div class="maintenance-form">
    <div class="background-watermark"></div>
    
    <div class="form-section top-section">
      <div class="header-row">
        <span class="order-number">Orden de trabajo: {{ radicado }}</span>
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
        <div class="form-group">
          <label for="techSignature">Firma técnico <span class="required">*</span></label>
          <input 
            type="text" 
            id="techSignature" 
            v-model="formData.techSignature" 
            class="form-input"
            :class="{ 'error': validationErrors.techSignature }"
          >
          <span v-if="validationErrors.techSignature" class="error-message">
            {{ validationErrors.techSignature }}
          </span>
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
<script setup>
import { ref, onMounted, watch, reactive } from 'vue'
import Cookies from 'js-cookie'
import Swal from 'sweetalert2'
import apiService from "../../../service/apiService"
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const radicado = ref('')
const workOrder = ref(null)
const assetInfo = ref(null)
const maintenanceType = ref('Preventivo')
const sparePartsStatus = ref('No')
const orderState = ref(true)
const wordOrdenId = ref(null)
const userId = ref(null)

const validationErrors = reactive({
  maintenanceType: '',
  workDescription: '',
  observations: '',
  sparePartsStatus: '',
  partsDetails: '',
  techSignature: ''
})

const formData = ref({
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
})

const getUserData = () => {
  const authToken = Cookies.get('authToken');

  if (authToken) {
    try {
      const tokenParts = authToken.split('.');
      const payload = JSON.parse(atob(tokenParts[1])); 
      const userIdFromToken = payload.sub; 

      if (userIdFromToken) {
        userId.value = userIdFromToken; 

        apiService.get(`/users/${userId.value}`)
          .then(response => {
            if (response && response.name) {
              formData.value.executedBy = response.name;
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
};

const fetchData = async () => {
  try {
    Swal.showLoading()
    
    const Id = Cookies.get('OrdenId')
    if (!Id) throw new Error('No se encontró el ID de la orden')
    
    wordOrdenId.value = Id
    await getUserData()
    
    const response = await apiService.get(`/word-orden/${Id}`)
    workOrder.value = response
    console.log("ID de solicitud encontrado:", workOrder.value)
    
    // Corrección aquí: Verificar que solicitud._id existe y pasarlo directamente
    if (workOrder.value?.solicitud?._id) {
      await fetchAssetInfo(workOrder.value.solicitud._id)
    } else {
      console.error("No se encontró el ID de la solicitud en la respuesta")
    }
    
    mapWorkOrderToForm()
    Swal.close()
    
  } catch (error) {
    console.error('Error:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron cargar los datos',
      confirmButtonColor: '#39a900'
    })
  }
}

const fetchAssetInfo = async (solicitudId) => {
  try {
    // Verificar que solicitudId es un string válido
    if (!solicitudId || typeof solicitudId !== 'string') {
      console.error("ID de solicitud inválido:", solicitudId)
      throw new Error('ID de solicitud inválido')
    }
    
    console.log("Consultando información del activo con ID:", solicitudId)
    const response = await apiService.get(`/application-maintenance/Consultar/${solicitudId}`)
    
    if (response?.data?.assetInfo || response?.assetInfo) {
      assetInfo.value = response.data?.assetInfo || response.assetInfo
      mapAssetInfoToForm()
      
      if (response.requesterName) {
        formData.value.contactName = response.requesterName
        formData.value.phone = response.requesterPhone || ''
        formData.value.trackingNumber = response.trackingNumber || ''
      }
    }
  } catch (error) {
    console.error("Error al obtener la información del activo:", error)
    Swal.fire({
      icon: 'warning',
      title: 'Advertencia',
      text: 'No se pudo cargar la información del activo',
      toast: true,
      position: 'top-end',
      timer: 3000
    })
  }
}

const mapWorkOrderToForm = () => {
  if (!workOrder.value) return
  
  radicado.value = workOrder.value.radicado || ''
  
  if (workOrder.value.fechaInicio) {
    formData.value.startDate = new Date(workOrder.value.fechaInicio).toISOString().split('T')[0]
  }
  
  if (workOrder.value.fechaFin) {
    formData.value.endDate = new Date(workOrder.value.fechaFin).toISOString().split('T')[0]
  }
  
  formData.value.prioridad = workOrder.value.prioridad || ''
  
  if (workOrder.value.maintenances?.[0]) {
    const maintenance = workOrder.value.maintenances[0]
    maintenanceType.value = maintenance.typeMaintenance || 'Preventivo'
    formData.value.workDescription = maintenance.description || ''
    formData.value.observations = maintenance.observation || ''
    sparePartsStatus.value = maintenance.sparePartsStatus || 'No'
    formData.value.partsDetails = maintenance.sparePartsDetails || ''
    formData.value.techSignature = maintenance.technicalSignature || ''
    orderState.value = maintenance.state ?? true
  }
}

const mapAssetInfoToForm = () => {
  if (!assetInfo.value) return
  
  formData.value.serialNumber = assetInfo.value.serialNumber || ''
  formData.value.plateNumber = assetInfo.value.inventoryCode || ''
  formData.value.location = assetInfo.value.location || ''
}

const validateForm = () => {
  let isValid = true
  Object.keys(validationErrors).forEach(key => validationErrors[key] = '')
  
  if (!maintenanceType.value) {
    validationErrors.maintenanceType = 'Seleccione un tipo de mantenimiento'
    isValid = false
  }
  
  if (!formData.value.workDescription.trim()) {
    validationErrors.workDescription = 'La descripción es obligatoria'
    isValid = false
  }
  
  if (!formData.value.observations.trim()) {
    validationErrors.observations = 'Las observaciones son obligatorias'
    isValid = false
  }
  
  if (sparePartsStatus.value === 'Si' && !formData.value.partsDetails.trim()) {
    validationErrors.partsDetails = 'El detalle de repuestos es obligatorio'
    isValid = false
  }
  
  if (!formData.value.techSignature.trim()) {
    validationErrors.techSignature = 'La firma es obligatoria'
    isValid = false
  }
  
  return isValid
}

const validateAndSave = () => {
  if (validateForm()) {
    saveMaintenanceData()
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error de validación',
      text: 'Complete todos los campos obligatorios',
      confirmButtonColor: '#39a900'
    })
  }
}

const saveMaintenanceData = async () => {
  try {
    Swal.showLoading()
    
    const maintenanceData = {
      typeMaintenance: maintenanceType.value,
      description: formData.value.workDescription,
      observation: formData.value.observations,
      sparePartsStatus: sparePartsStatus.value,
      sparePartsDetails: formData.value.partsDetails,
      technicalId: userId.value,
      wordOrdenId: wordOrdenId.value,
      technicalSignature: formData.value.techSignature,
      state: orderState.value
    }
    
    await apiService.post('/maintenance', maintenanceData)
    
    Swal.fire({
      icon: 'success',
      title: '¡Guardado exitoso!',
      text: 'Los datos se han guardado correctamente',
      confirmButtonColor: '#39a900'
    })
    
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron guardar los datos',
      confirmButtonColor: '#39a900'
    })
  }
}

const generatePdfReport = async () => {
  try {
    Swal.showLoading()
    
    const doc = new jsPDF()
    
    doc.setFontSize(20)
    doc.text('Orden de Trabajo', 105, 20, { align: 'center' })
    
    doc.setFontSize(12)
    doc.text(`Número: ${radicado.value}`, 20, 40)
    
    doc.autoTable({
      startY: 50,
      head: [['Campo', 'Valor']],
      body: [
        ['Número de serie', formData.value.serialNumber],
        ['Número de placa', formData.value.plateNumber],
        ['Fecha inicio', formData.value.startDate],
        ['Fecha fin', formData.value.endDate],
        ['Ubicación', formData.value.location],
        ['Contacto', formData.value.contactName],
        ['Teléfono', formData.value.phone],
        ['Tipo de mantenimiento', maintenanceType.value],
        ['Descripción', formData.value.workDescription],
        ['Observaciones', formData.value.observations],
        ['Repuestos requeridos', sparePartsStatus.value],
        ['Detalle de repuestos', formData.value.partsDetails],
        ['Estado', orderState.value ? 'Ejecutado' : 'Pendiente'],
        ['Ejecutado por', formData.value.executedBy],
        ['Firma técnico', formData.value.techSignature]
      ]
    })
    
    doc.save(`orden-trabajo-${radicado.value}.pdf`)
    
    resetForm()
    
    Swal.fire({
      icon: 'success',
      title: 'PDF Generado',
      text: 'El informe se ha generado correctamente',
      confirmButtonColor: '#39a900'
    })
    
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo generar el informe',
      confirmButtonColor: '#39a900'
    })
  }
}

const confirmReset = () => {
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
      resetForm()
      Swal.fire({
        icon: 'success',
        title: 'Formulario limpiado',
        showConfirmButton: false,
        timer: 1500
      })
    }
  })
}

const resetForm = () => {
  formData.value.workDescription = ''
  formData.value.observations = ''
  formData.value.partsDetails = ''
  formData.value.techSignature = ''
  maintenanceType.value = 'Preventivo'
  sparePartsStatus.value = 'No'
  orderState.value = true
  Object.keys(validationErrors).forEach(key => validationErrors[key] = '')
}

watch(sparePartsStatus, (newValue) => {
  if (newValue === 'No' || newValue === 'No aplica') {
    formData.value.partsDetails = ''
    validationErrors.partsDetails = ''
  }
})

onMounted( async () => {
  await fetchData()
})
</script>
<style scoped>
.maintenance-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Arial, sans-serif;
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
  color: #39a900;
  margin: 0;
  font-weight: 600;
}

.action-button {
  background: #39a900;
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
  background: #2d8500;
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
  border-color: #39a900;
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
  color: #39a900;
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
  color: #39a900;
  border-color: #39a900;
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
  background-color: #39a900;
  color: white;
}

.cancel-button:hover {
  background-color: #f8f9fa;
}

.submit-button:hover {
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