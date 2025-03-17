<template>
    <div class="container">
      <div class="header">
        <h3 >Maquinaria y equipos</h3>
        <h5>{{ isUpdating ? "Actualizar Categoría" : "Agregar Categoría" }}</h5>
      </div>
  
      <div class="form-container">
        <div class="form-group">
          <h2>Nombre de la Categoría</h2>
          <input v-model="name" placeholder="Nombre" class="input-nombre" />
        </div>
  
        <div class="columns">
          <!-- Specifications Section -->
          <div class="column">
            <h2>Agregar especificaciones técnicas</h2>
            <div class="input-group">
              <input
                v-model="spec"
                placeholder="Especificación..."
                class="input"
                type="area"
              />
              <button @click="addSpec" class="button">Agregar</button>
            </div>
            <div class="tags">
              <span v-for="(s, i) in specs" :key="i" class="tag">
                {{ s }}
                <button @click="removeSpec(i)" class="tag-close">×</button>
              </span>
            </div>
          </div>
  
          <!-- Accessories Section -->
          <div class="column">
            <h2>Agregar accesorios</h2>
            <div class="input-group">
              <input
                v-model="accessory"
                placeholder="Accesorio..."
                class="input"
              />
              <button @click="addAccessory" class="button-rounded">Agregar</button>
            </div>
            <div class="tags">
              <span v-for="(a, i) in accessories" :key="i" class="tag">
                {{ a }}
                <button @click="removeAccessory(i)" class="tag-close">×</button>
              </span>
            </div>
          </div>
        </div>
  
        <div class="variables-section">
          <h2>Variables de operación</h2>
          <div class="checkbox-group">
            <label
              v-for="variable in variables"
              :key="variable"
              class="checkbox-label"
            >
              <input
                type="checkbox"
                :value="variable"
                v-model="operationVars"
                class="checkbox"
              />
              <span>{{ variable }}</span>
            </label>
          </div>
          <div class="new-variable-group">
            <div class="input-container">
              <input
                v-model="newVariable"
                placeholder="Nueva variable..."
                class="input"
              />
              <button @click="addVariable" class="button-rounded">Agregar</button>
            </div>
          </div>
        </div>
  
        <button @click="handleSubmit" class="submit-button">
          {{ isUpdating ? "Actualizar Categoría" : "Crear Categoría" }}
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from "vue";
  import { useRouter } from "vue-router";
  import { useStore } from "vuex";
  import apiService from "../../service/apiservice";
  import Cookies from 'js-cookie'; // Importar js-cookie

  const router = useRouter();
  const store = useStore();

  const name = ref("");
  const spec = ref("");
  const accessory = ref("");
  const specs = ref([]);
  const accessories = ref([]);
  const operationVars = ref([]); // Aquí se almacenan las variables de operación seleccionadas
  const newVariable = ref("");
  const variables = ref(["Aceite", "Electricidad", "Presión", "Caudal", "Voltios"]); // Lista de variables disponibles

  // Obtener el ID de la categoría desde la cookie
  const categoryId = Cookies.get('categoryId');

  const isUpdating = computed(() => !!categoryId);

  const clearForm = () => {
    name.value = "";
    specs.value = [];
    accessories.value = [];
    operationVars.value = [];
  };

  const addSpec = () => {
    if (spec.value) {
      specs.value.push(spec.value);
      spec.value = "";
    }
  };

  const removeSpec = (index) => {
    specs.value.splice(index, 1);
  };

  const addAccessory = () => {
    if (accessory.value) {
      accessories.value.push(accessory.value);
      accessory.value = "";
    }
  };

  const removeAccessory = (index) => {
    accessories.value.splice(index, 1);
  };

  const addVariable = () => {
    if (newVariable.value && !variables.value.includes(newVariable.value)) {
      variables.value.push(newVariable.value); // Agrega la nueva variable a la lista
      operationVars.value.push(newVariable.value); // Selecciona la nueva variable automáticamente
      newVariable.value = "";
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        name: name.value,
        operationVars: operationVars.value,
        accessories: accessories.value,
        specs: specs.value,
        state: true,
      };

      if (isUpdating.value) {
        // Actualizar categoría existente
        await apiService.patch(`/Categorias/${categoryId}`, data);
        store.dispatch("showToast", {
          title: "Categoría Actualizada",
          description: "La categoría se ha actualizado con éxito.",
          status: "success",
        });
      } else {
        // Crear nueva categoría
        await apiService.post("/Categorias", data);
        store.dispatch("showToast", {
          title: "Categoría Creada",
          description: "La categoría se ha creado con éxito.",
          status: "success",
        });
      }

      clearForm();
      Cookies.remove('categoryId'); // Eliminar la cookie después de guardar
      router.push('/machineandteams/add'); // Redirigir al segundo componente
    } catch (error) {
      store.dispatch("showToast", {
        title: "Error",
        description: "Hubo un problema al guardar los datos.",
        status: "error",
      });
    }
  };

  // Cargar los datos de la categoría si existe un ID
  onMounted(async () => {
    if (categoryId) {
      try {
        const response = await apiService.get(`/Categorias/${categoryId}`);
        name.value = response.name || "";
        specs.value = response.specs || [];
        accessories.value = response.accessories || [];
        operationVars.value = response.operationVars || []; // Cargar las variables de operación
      } catch (error) {
        console.error("Error fetching category data:", error);
      }
    }
  });

  onUnmounted(() => {
  Cookies.remove('categoryId');
  });
  </script>
    
    <style scoped>
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding:0 1rem;
      font-family: system-ui, -apple-system, sans-serif;
    }
    
    .header {
      margin-bottom: 2rem;
      text-align: start;
    }
    
    .header h3 {
      color: #ffffff;
      margin: 0;
      letter-spacing: -0.025em;
    }
    
    .header h5 {
      font-size: 1rem;
      color: #494949;
      margin-top: 0.5rem;
    }
    
    .form-container {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-group h2 {
      display: block;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      letter-spacing: -0.025em;
      color: #000000;
    }
    
    .input-nombre {
      width: 100%;
      height: 2.5rem;
      padding: 0 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 0.75rem;
      font-size: 1rem;
      transition: all 0.2s;
      background-color: #f8fafc;
    }
    
    .input-nombre:focus {
      outline: none;
      background-color: white;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    
    .columns {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    
    .column h2 {
      font-size: 1rem;
      font-weight: 600;
      color: #000000;
      margin-bottom: 1rem;
      letter-spacing: -0.025em;
    }
    
    .input {
      flex: 1;
      height: 2.5rem;
      padding: 0 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      transition: all 0.2s;
      background-color: #f8fafc;
    }
    
    .input:focus {
      outline: none;
      background-color: white;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    
    .input-group {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    
    .button, .button-rounded {
      background: #39A900;
      color: white;
      border: none;
      padding: 0 1.5rem;
      height: 2.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .button {
      border-radius: 0.75rem;
    }
    
    .button-rounded {
      border-radius: 9999px;
    }
    
    .button:hover, .button-rounded:hover {
      background: #39A900;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .tag {
      display: inline-flex;
      align-items: center;
      background: #f1f5f9;
      border-radius: 9999px;
      padding: 0.25rem 1rem;
      font-size: 0.875rem;
      color: #475569;
      border: 1px solid #e2e8f0;
    }
    
    .tag-close {
      background: none;
      border: none;
      color: #94a3b8;
      margin-left: 0.5rem;
      padding: 0;
      cursor: pointer;
      font-size: 1.25rem;
      line-height: 1;
      transition: color 0.2s;
    }
    
    .tag-close:hover {
      color: #475569;
    }
    
    .variables-section {
      margin-bottom: 1.5rem;
    }
    
    .variables-section h2 {
      font-size: 1rem;
      font-weight: 600;
      color: #39A900;
      margin-bottom: 1rem;
      text-align: center;
      letter-spacing: -0.025em;
    }
    
    .checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1rem;
      justify-content: center;
    }
    
    .checkbox-label {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }
    
    .checkbox {
      appearance: none;
      width: 1.25rem;
      height: 1.25rem;
      border: 2px solid #39A900;
      border-radius: 0.375rem;
      margin-right: 0.5rem;
      position: relative;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .checkbox:checked {
      background-color: #39A900;
    }
    
    .checkbox:checked::after {
      content: '✓';
      position: absolute;
      color: white;
      font-size: 0.875rem;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    
    .new-variable-group {
      display: flex;
      justify-content: center;
      padding: 0 1rem;
    }
    
    .input-container {
      display: flex;
      gap: 0.75rem;
      width: 100%;
      max-width: 400px;
    }
    
    .submit-button {
      background: #39A900;
      color: white;
      border: none;
      border-radius: 9999px;
      padding: 0.75rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: block;
      margin: 1.5rem auto 0;
      min-width: 200px;
    }
    
    .submit-button:hover {
      background: #39A900;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }
    
      .header h1 {
        font-size: 1.25rem;
      }
    
      .header p {
        font-size: 0.875rem;
      }
    
      .form-container {
        padding: 1rem;
      }
    
      .columns {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    
      .input-nombre, .input {
        height: 2.25rem;
        font-size: 0.875rem;
      }
    
      .button, .button-rounded {
        height: 2.25rem;
        font-size: 0.75rem;
        padding: 0 1rem;
      }
    
      .submit-button {
        padding: 0.5rem 1.5rem;
        font-size: 0.875rem;
      }
    }
    
    @media (max-width: 480px) {
      .header h1 {
        font-size: 1.125rem;
      }
    
      .header p {
        font-size: 0.75rem;
      }
    
      .input-nombre, .input {
        height: 2rem;
        font-size: 0.75rem;
      }
    
      .button, .button-rounded {
        height: 2rem;
        font-size: 0.625rem;
        padding: 0 0.75rem;
      }
    
      .submit-button {
        padding: 0.5rem 1rem;
        font-size: 0.75rem;
      }
    }
    </style>




