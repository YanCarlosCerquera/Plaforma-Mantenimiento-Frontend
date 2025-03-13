<template>
    <div v-if="isOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Selecciona características</h3>
          <button class="close-button" @click="close">×</button>
        </div>
        
        <div class="modal-content">
          <!-- Specifications Section -->
          <div class="modal-section">
            <h4>Agregar especificaciones</h4>
            <div class="input-group">
              <input
                v-model="newSpecification"
                type="text"
                placeholder="Especificación..."
                @keyup.enter="addSpecification"
              />
              <button 
                class="add-button"
                @click="addSpecification"
                :disabled="!newSpecification"
              >
                Agregar
              </button>
            </div>
            <div class="tags-container">
              <div v-for="(spec, index) in specifications" :key="'spec-'+index" class="tag">
                {{ spec }}
                <button class="tag-remove" @click="removeSpecification(index)">×</button>
              </div>
            </div>
          </div>
  
          <!-- Accessories Section -->
          <div class="modal-section">
            <h4>Agregar accesorios</h4>
            <div class="input-group">
              <input
                v-model="newAccessory"
                type="text"
                placeholder="Accesorio..."
                @keyup.enter="addAccessory"
              />
              <button 
                class="add-button"
                @click="addAccessory"
                :disabled="!newAccessory"
              >
                Agregar
              </button>
            </div>
            <div class="tags-container">
              <div v-for="(acc, index) in accessories" :key="'acc-'+index" class="tag">
                {{ acc }}
                <button class="tag-remove" @click="removeAccessory(index)">×</button>
              </div>
            </div>
          </div>
  
          <!-- Operation Variables Section -->
          <div class="modal-section">
            <h4>Variables de operación</h4>
            <div class="variables-grid">
              <label class="checkbox-label">
                <input type="checkbox" v-model="operationVars.aceite" />
                Aceite
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="operationVars.caudal" />
                Caudal
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="operationVars.presion" />
                Presión
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="operationVars.electricidad" />
                Electricidad
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="operationVars.voltios" />
                Voltios
              </label>
            </div>
            <div class="input-group">
              <input
                v-model="newVariable"
                type="text"
                placeholder="Variable..."
                @keyup.enter="addVariable"
              />
              <button 
                class="add-button"
                @click="addVariable"
                :disabled="!newVariable"
              >
                Agregar
              </button>
            </div>

            <div class="modal-section">
              <h4>Nombre</h4>
              <div class="input-group">
                <input
                  v-model="name"
                  type="text"
                  placeholder="Nombre..."
                />
              </div>
            </div>
          </div>
        </div>
  
        <div class="modal-footer">
          <button class="save-button" @click="save">Guardar</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits } from 'vue';
  
  defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

  const emit = defineEmits(['close', 'save']);
  
  // State
  const name = ref('');
  const newSpecification = ref('');
  const newAccessory = ref('');
  const newVariable = ref('');
  const specifications = ref([]);
  const accessories = ref([]);
  const operationVars = ref({
    aceite: false,
    caudal: false,
    presion: false,
    electricidad: false,
    voltios: false
  });
  
  // Methods
  const addSpecification = () => {
    if (newSpecification.value.trim()) {
      specifications.value.push(newSpecification.value.trim());
      newSpecification.value = '';
    }
  };
  
  const removeSpecification = (index) => {
    specifications.value.splice(index, 1);
  };
  
  const addAccessory = () => {
    if (newAccessory.value.trim()) {
      accessories.value.push(newAccessory.value.trim());
      newAccessory.value = '';
    }
  };
  
  const removeAccessory = (index) => {
    accessories.value.splice(index, 1);
  };
  
  const addVariable = () => {
    if (newVariable.value.trim()) {
      operationVars.value[newVariable.value.trim()] = false;
      newVariable.value = '';
    }
  };
  
  const save = () => {
    const selectedOperationVars = Object.keys(operationVars.value)
      .filter(key => operationVars.value[key])
      .map(key => key);

    emit('save', {
      name: name.value,
      specifications: specifications.value,
      accessories: accessories.value,
      operationVars: selectedOperationVars
    });
    close();
  };
  
  const close = () => {
    emit('close');
  };
  </script>
  
  <style scoped>
  .modal-overlay {
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
  
  .modal-container {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .modal-header {
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-header h3 {
    margin: 0;
    color: #2ea12e;
    font-size: 1.25rem;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }
  
  .modal-content {
    padding: 1rem;
  }
  
  .modal-section {
    margin-bottom: 1.5rem;
  }
  
  .modal-section h4 {
    color: #333;
    margin-bottom: 0.5rem;
  }
  
  .input-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .input-group input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.875rem;
  }
  
  .add-button {
    background-color: #2ea12e;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
  
  .add-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .tag {
    background-color: #e8f5e8;
    color: #2ea12e;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
  }
  
  .tag-remove {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 0 0.25rem;
  }
  
  .variables-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #666;
  }
  
  .modal-footer {
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
  }
  
  .save-button {
    background-color: #2ea12e;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .save-button:hover {
    background-color: #248f24;
  }
  </style>