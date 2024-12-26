<template>
  <div>
    <!-- Category field with + button -->
    <div class="form-group category-field">
      <label for="categoryId">Categoría</label>
      <div class="category-input-group">
        <select 
          id="categoryId"
          v-model="formData.categoryId"
          class="form-select"
        >
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        <v-btn
          icon
          color="#2EA12E"
          size="small"
          class="ml-2"
          @click="dialog = true"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Modal -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h5 bg-success text-white pa-4">
          Selecciona características
        </v-card-title>

        <v-card-text class="pa-4">
          <!-- Specifications Section -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3">Agregar especificaciones</h3>
            <div class="d-flex align-center mb-2">
              <v-text-field
                v-model="newSpec"
                label="Especificación..."
                hide-details
                dense
                class="mr-2"
              ></v-text-field>
              <v-btn color="success" @click="addSpecification">
                Agregar
              </v-btn>
            </div>
            <div class="mt-3">
              <v-chip
                v-for="(spec, index) in specifications"
                :key="index"
                class="mr-2 mb-2"
                closable
                @click:close="removeSpecification(index)"
              >
                {{ spec }}
              </v-chip>
            </div>
          </div>

          <!-- Accessories Section -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3">Agregar accesorios</h3>
            <div class="d-flex align-center mb-2">
              <v-text-field
                v-model="newAccessory"
                label="Accesorio..."
                hide-details
                dense
                class="mr-2"
              ></v-text-field>
              <v-btn color="success" @click="addAccessory">
                Agregar
              </v-btn>
            </div>
            <div class="mt-3">
              <v-chip
                v-for="(accessory, index) in accessories"
                :key="index"
                class="mr-2 mb-2"
                closable
                @click:close="removeAccessory(index)"
              >
                {{ accessory }}
              </v-chip>
            </div>
          </div>

          <!-- Operation Variables -->
          <div>
            <h3 class="text-h6 mb-3">Variables de operación</h3>
            <div class="d-flex flex-wrap align-center">
              <v-checkbox
                v-model="operationVariables"
                label="Aceite"
                value="aceite"
                class="mr-4"
              ></v-checkbox>
              <v-checkbox
                v-model="operationVariables"
                label="Caudal"
                value="caudal"
                class="mr-4"
              ></v-checkbox>
              <v-checkbox
                v-model="operationVariables"
                label="Presión"
                value="presion"
                class="mr-4"
              ></v-checkbox>
              <v-checkbox
                v-model="operationVariables"
                label="Electricidad"
                value="electricidad"
                class="mr-4"
              ></v-checkbox>
              <v-checkbox
                v-model="operationVariables"
                label="Voltios"
                value="voltios"
              ></v-checkbox>
            </div>
            
            <!-- Custom Variable Input -->
            <div class="d-flex align-center mt-3">
              <v-text-field
                v-model="newVariable"
                label="Variable..."
                hide-details
                dense
                class="mr-2"
              ></v-text-field>
              <v-btn color="success" @click="addVariable">
                Agregar
              </v-btn>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="success"
            @click="saveAndClose"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'

const emit = defineEmits(['update:modelValue', 'save'])

const dialog = ref(false)
const newSpec = ref('')
const newAccessory = ref('')
const newVariable = ref('')
const specifications = ref(['Corei9 ultra'])
const accessories = ref(['Teclado mecanico corsair'])
const operationVariables = ref(['presion', 'voltios'])
const categories = ref([
  { id: 1, name: 'Computo' },
  { id: 2, name: 'Mobiliario' },
  { id: 3, name: 'Herramientas' }
])

const formData = ref({
  categoryId: ''
})

const addSpecification = () => {
  if (newSpec.value.trim()) {
    specifications.value.push(newSpec.value)
    newSpec.value = ''
  }
}

const removeSpecification = (index) => {
  specifications.value.splice(index, 1)
}

const addAccessory = () => {
  if (newAccessory.value.trim()) {
    accessories.value.push(newAccessory.value)
    newAccessory.value = ''
  }
}

const removeAccessory = (index) => {
  accessories.value.splice(index, 1)
}

const addVariable = () => {
  if (newVariable.value.trim()) {
    operationVariables.value.push(newVariable.value)
    newVariable.value = ''
  }
}

const saveAndClose = () => {
  emit('save', {
    specifications: specifications.value,
    accessories: accessories.value,
    operationVariables: operationVariables.value
  })
  dialog.value = false
}
</script>

<style scoped>
.category-field {
  position: relative;
}

.category-input-group {
  display: flex;
  align-items: center;
}

.form-select {
  flex: 1;
}

/* Inherit existing styles from the main form */
.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.875rem;
}

.form-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
}

.form-select:focus {
  outline: none;
  border-color: #2EA12E;
  box-shadow: 0 0 0 2px rgba(46, 161, 46, 0.1);
}
</style>