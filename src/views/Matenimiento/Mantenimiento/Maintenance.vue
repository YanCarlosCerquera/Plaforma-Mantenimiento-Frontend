<template>
  <div class="maintenance-form">
    <!-- Top Section -->
    <div class="form-section top-section">
      <div class="header-row">
        <span class="order-number">Orden de trabajo: {{ orderNumber }}</span>
        <div class="title-actions">
          <h2 class="main-title">Orden de Trabajo</h2>
          <button class="action-button" @click="generateReport">Realizar informe</button>
          <div class="pdf-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M7 18H17V16H7V18Z" fill="currentColor"/>
              <path d="M17 14H7V12H17V14Z" fill="currentColor"/>
              <path d="M7 10H11V8H7V10Z" fill="currentColor"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label for="serialNumber">Numero de serie</label>
          <input type="text" id="serialNumber" v-model="formData.serialNumber" class="form-input">
        </div>
        <div class="form-group">
          <label for="plateNumber">Numero de placa</label>
          <input type="text" id="plateNumber" v-model="formData.plateNumber" class="form-input">
        </div>
        <div class="form-group">
          <label for="startDate">Fecha inicio</label>
          <input type="date" id="startDate" v-model="formData.startDate" class="form-input">
        </div>
        <div class="form-group">
          <label for="contactName">Nombre de contacto</label>
          <input type="text" id="contactName" v-model="formData.contactName" class="form-input">
        </div>
        <div class="form-group">
          <label for="phone">Teléfono</label>
          <input type="text" id="phone" v-model="formData.phone" class="form-input">
        </div>
        <div class="form-group">
          <label for="endDate">Fecha fin</label>
          <input type="date" id="endDate" v-model="formData.endDate" class="form-input">
        </div>
        <div class="form-group">
          <label for="location">Ubicación</label>
          <input type="text" id="location" v-model="formData.location" class="form-input">
        </div>
        <div class="form-group">
          <label for="startTime">Hora inicio</label>
          <input type="time" id="startTime" v-model="formData.startTime" class="form-input">
        </div>
        <div class="form-group">
          <label for="endTime">Hora fin</label>
          <input type="time" id="endTime" v-model="formData.endTime" class="form-input">
        </div>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="form-section bottom-section">
      <h2 class="section-title">Trabajo realizado</h2>

      <div class="two-columns">
        <!-- Left Column -->
        <div class="column">
          <div class="form-group">
            <label class="label-text">Mantenimiento realizado</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.maintenanceType.preventive" class="checkbox-input">
                <span>Preventivo</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.maintenanceType.corrective" class="checkbox-input">
                <span>Correctivo</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="workDescription">Descripción del trabajo y/o servicio solicitado</label>
            <textarea id="workDescription" v-model="formData.workDescription" class="form-textarea" rows="4"></textarea>
          </div>

          <div class="form-group">
            <label for="observations">Observaciones</label>
            <textarea id="observations" v-model="formData.observations" class="form-textarea" rows="3"></textarea>
          </div>
        </div>

        <!-- Right Column -->
        <div class="column">
          <div class="form-group">
            <label class="label-text">Repuestos requeridos</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.partsRequired.yes" class="checkbox-input">
                <span>Si</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.partsRequired.no" class="checkbox-input">
                <span>No</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.partsRequired.notApplicable" class="checkbox-input">
                <span>No aplica</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="partsDetails">Detalle de repuestos</label>
            <textarea id="partsDetails" v-model="formData.partsDetails" class="form-textarea" rows="4"></textarea>
          </div>
        </div>
      </div>

      <!-- Bottom Row -->
      <div class="bottom-row">
        <div class="form-group">
          <label class="label-text">Estado Orden de trabajo</label>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.orderStatus.executed" class="checkbox-input">
              <span>Ejecutado</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.orderStatus.pending" class="checkbox-input">
              <span>Pendiente</span>
            </label>
          </div>
        </div>
        <div class="form-group">
          <label for="executedBy">Ejecutado por:</label>
          <input type="text" id="executedBy" v-model="formData.executedBy" class="form-input">
        </div>
        <div class="form-group">
          <label for="techSignature">Firma técnico</label>
          <input type="text" id="techSignature" v-model="formData.techSignature" class="form-input">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Props for customization
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({})
  },
  orderNumber: {
    type: String,
    default: 'OT-2024-9054'
  }
});

// Emits for form actions
const emit = defineEmits(['submit', 'cancel', 'generate-report']);

// Form data with default values
const formData = ref({
  serialNumber: '',
  plateNumber: '',
  contactName: '',
  phone: '',
  location: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  maintenanceType: {
    preventive: false,
    corrective: false
  },
  workDescription: '',
  observations: '',
  orderStatus: {
    executed: false,
    pending: false
  },
  partsRequired: {
    yes: false,
    no: false,
    notApplicable: false
  },
  partsDetails: '',
  executedBy: '',
  techSignature: '',
  ...props.initialData
});

// Form methods



const generateReport = () => {
  emit('generate-report', formData.value);
};
</script>

<style scoped>
.maintenance-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.form-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.order-number {
  font-size: 14px;
  color: #4a5568;
}

.title-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.main-title {
  font-size: 20px;
  color: #39a900;
  margin: 0;
}

.action-button {
  background: #39a900;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.pdf-icon {
  width: 24px;
  height: 24px;
  color: #4a5568;
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
  font-size: 14px;
  color: #4a5568;
  margin-bottom: 4px;
}

.form-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
}

.form-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
}

.section-title {
  text-align: center;
  color: #39a900;
  font-size: 20px;
  margin: 0 0 20px 0;
}

.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 20px;
}

.checkbox-group {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4a5568;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #39a900;
}

.bottom-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .two-columns {
    grid-template-columns: 1fr;
  }

  .bottom-row {
    grid-template-columns: 1fr;
  }

  .header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .title-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>