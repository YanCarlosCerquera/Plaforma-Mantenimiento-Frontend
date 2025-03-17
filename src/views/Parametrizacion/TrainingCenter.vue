<script setup>
import { ref, onMounted, computed, watch } from "vue";
import AuthorsTable from "../components/AuthorsTable.vue";
import apiService from "../../service/apiservice";
import Swal from "sweetalert2";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonAutocomplete from "@/components/ArgonAutocomplete.vue";

// Datos del centro de formación
const trainingCenter = ref({
    name: "",
    regional: "",
    code: "",
    cityId: "",
    state: true,
    _id: "",
});
const trainingCenterId = ref("");
const headers = ref([
    { text: "Nombre", value: "trainingCenter.name" },
    { text: "Departamento", value: "trainingCenter.cityId.departamentId.name" },
    { text: "Regional", value: "trainingCenter.regional" },
    { text: "Municipio", value: "trainingCenter.cityId.name" },
    { text: "Estado", value: "trainingCenter.state" },
]);

const fields = ref({
    name: {
        value: "name",
        class: "align-middle",
        textClass: "text-xs font-weight-bold mb-0",
    },
    dapartamento: {
        value: "cityId.departamentId.name",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
    },
    regional: {
        value: "regional",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
    },
    city: {
        value: "cityId.name",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
    },
    state: {
        value: "state",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
    },
});

const rows = ref([]);
const departaments = ref([]);
const citys = ref([]);
const dialog = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);
const departamentId = ref("")

// Obtener datos de la API
const fetchData = async () => {
    try {
        const response = await apiService.get("/training-centers");
        rows.value = response.map((center) => ({
            ...center,
            state: center.state ? "Activo" : "Inactivo",
        }));
    } catch (error) {
        console.error("Error fetching training centers:", error);
        alert("Error al cargar los centros de formación");
    }
};

const fetchDepartaments = async () => {
    try {
        const response = await apiService.get("/departaments");
        departaments.value = response.map((departament) => ({
            value: departament._id,
            title: departament.name,
        }));
    } catch (error) {
        console.error("Error fetching departaments:", error);
        alert("Error al cargar los departamentos");
    }
};

const fetchCitys = async () => {
    try {
        const response = await apiService.get(`/city`);
        citys.value = response.map((city) => ({
            value: city._id,
            title: city.name,
            departamentId: city.departamentId._id, // Asegúrate de que la API devuelva este campo
        }));
    } catch (error) {
        console.error("Error fetching cities:", error);
        alert("Error al cargar los municipios");
    }
};

// Editar un centro de formación
const handleEdit = (row) => {    
    trainingCenter.value = { ...row };
    trainingCenter.value.state = row.state === "Activo" ? true : false;
    trainingCenterId.value = row._id;
    departamentId.value = row.cityId.departamentId._id;
    trainingCenter.value.cityId = row.cityId._id;
    isEditing.value = true;
    dialog.value = true;
};

// Cancelar edición/creación
const handleCancel = () => {
    Object.keys(trainingCenter.value).forEach((key) => (trainingCenter.value[key] = ""));
    departamentId.value = ""
    trainingCenterId.value = "";
    isEditing.value = false;
    dialog.value = false;
};

// Eliminar un centro de formación
const handleDelete = async (row) => {
    const result = await Swal.fire({
        title: "¿Estás seguro de que quieres eliminar este centro de formación?",
        text: "Esta acción no puede deshacerse.",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        customClass: {
            title: "text-succes",
            confirmButton: "btn-success",
            cancelButton: "btn-danger",
        },
    });

    if (!result.isConfirmed) {
        return;
    }

    try {
        await apiService.delete(`training-centers/${row._id}`);
        Swal.fire({
            title: "Centro de formación eliminado correctamente",
            icon: "success",
            position: "bottom-right",
            toast: true,
            timer: 3000,
            background: "#28a745",
            color: "white",
            iconColor: "white",
            showConfirmButton: false,
            customClass: {
                title: "swal-title-white",
            },
        });
        await fetchData();
    } catch (error) {
        Swal.fire({
            title: "Error al eliminar centro de formación.",
            text: error.response?.data?.message || "Algo salió mal.",
            icon: "error",
            position: "bottom-right",
            toast: true,
            timer: 3000,
            background: "#dc3545",
            color: "white",
            iconColor: "white",
            showConfirmButton: false,
            customClass: {
                title: "swal-title-white",
            },
        });
    }
};

// Crear o editar un centro de formación
const handleSubmit = async () => {
    try {
        isLoading.value = true;

        const data = {
            name: trainingCenter.value.name,
            regional: trainingCenter.value.regional,
            code: trainingCenter.value.code,
            cityId: trainingCenter.value.cityId,
            state: trainingCenter.value.state,
        };

        if (isEditing.value) {
            await apiService.patch(`training-centers/${trainingCenterId.value}`, data);

            Swal.fire({
                title: "Centro de formación editado exitosamente",
                icon: "success",
                position: "bottom-right",
                toast: true,
                timer: 3000,
                background: "#28a745",
                color: "white",
                iconColor: "white",
                showConfirmButton: false,
                customClass: {
                    title: "swal-title-white",
                },
            });
        } else {
            await apiService.post("training-centers", data);

            Swal.fire({
                title: "Centro de formación creado exitosamente",
                icon: "success",
                position: "bottom-right",
                toast: true,
                timer: 3000,
                background: "#28a745",
                color: "white",
                iconColor: "white",
                showConfirmButton: false,
                customClass: {
                    title: "swal-title-white",
                },
            });
        }

        handleCancel();
        await fetchData();
    } catch (error) {
        Swal.fire({
            title: "Error al " + (isEditing.value ? "editar" : "crear") + " centro de formación: ",
            text: error.response?.data?.message || "Algo salió mal.",
            icon: "error",
            position: "bottom-right",
            toast: true,
            timer: 3000,
            background: "#dc3545",
            color: "white",
            iconColor: "white",
            showConfirmButton: false,
            customClass: {
                title: "swal-title-white",
            },
        });
    } finally {
        isLoading.value = false;
    }
};

// Abrir diálogo para crear un nuevo centro de formación
const openCreateDialog = () => {
    trainingCenter.value = {
        name: "",
        regional: "",
        code: "",
        cityId: "",
        state: true,
    };
    isEditing.value = false;
    dialog.value = true;
};

const icons = ref([
    { class: 'fas fa-edit', method: handleEdit },
    { class: 'fas fa-trash', method: handleDelete },
]);

const isCityAutocompleteDisabled = computed(() => {
    return !departamentId.value;
});

const filteredCitys = computed(() => {
    if (!departamentId.value) {
        return []; 
    }
    return citys.value.filter((city) => city.departamentId === departamentId.value);
});

watch(departamentId, (newDepartamentId) => {
    if (!newDepartamentId) {
        trainingCenter.value.cityId = ""; 
    }
});

onMounted(async () => {
    await fetchData();
    await fetchDepartaments();
    await fetchCitys();
});
</script>

<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <AuthorsTable :title="'Centros de Formación'" :headers="headers" :rows="rows" :fields="fields"
                    :icons="icons">
                    <template #add-button>
                        <button class="btn btn-custom" @click="openCreateDialog">
                            <i class="fas fa-plus me-2"></i>Agregar Nuevo Centro
                        </button>
                    </template>
                </AuthorsTable>
            </div>
        </div>

        <!-- Diálogo para crear/editar centros de formación -->
        <v-dialog v-model="dialog" :fullscreen="mobile" scrollable persistent max-width="800px">
            <v-card class="bg-white">
                <v-card-title class="card-title d-flex align-items-center justify-content-center text-h4 text-succes"
                    style="margin: 1rem">
                    {{ isEditing ? 'Editar centro de formación' : 'Crear nuevo centro de formación' }}
                </v-card-title>
                <v-card-text class="card-body p-3">
                    <v-container>
                        <form @submit.prevent="handleSubmit">
                            <div class="row">
                                <div class="row" style="width: 100%">
                                    <div>
                                        <label for="example-text-input" class="form-control-label">Nombre del centro</label>
                                        <argon-input id="name" type="text" v-model="trainingCenter.name" />
                                    </div>
                                    <div>
                                        <label for="example-text-input" class="form-control-label">Selecciona un regional</label>
                                        <argon-input id="regional" type="text" v-model="trainingCenter.regional" />
                                    </div>
                                    <div>
                                        <label for="example-text-input" class="form-control-label">Código del centro</label>
                                        <argon-input id="code" type="text" v-model="trainingCenter.code" />
                                    </div>
                                    <div>
                                        <label for="example-text-input" class="form-control-label">Selecciona un departamento</label>
                                        <ArgonAutocomplete id="departamentId" type="text" v-model="departamentId" :items="departaments" />
                                    </div>
                                    <div>
                                        <label for="example-text-input" class="form-control-label">Selecciona un municipio</label>
                                        <ArgonAutocomplete id="cityId" type="text" v-model="trainingCenter.cityId" :items="filteredCitys" :disabled="isCityAutocompleteDisabled" />
                                    </div>
                                </div>
                            </div>
                            <v-card-actions class="d-flex justify-content-center mt-4"
                                style="gap: 60px; padding-top: 20px">
                                <button class="btn btn-danger" type="button" @click="handleCancel">
                                    Cancelar
                                </button>
                                <button class="btn btn-success" type="submit">
                                    {{ isEditing ? 'Guardar cambios' : 'Crear centro' }}
                                </button>
                            </v-card-actions>
                        </form>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<style scoped>
/* Estilos personalizados para el botón */
.btn-custom {
    background-color: white;
    color: #39A900;
    border: 1px solid #2d8000;
    transition: all 0.3s ease;
    margin-bottom: 0%;
}

.btn-custom:hover {
    background-color: #2d8000;
    color: white;
}

/* Estilos para la tarjeta del diálogo */
.v-card {
    color: rgba(0, 0, 0, 0.87);
}

.v-card-title {
    color: rgba(0, 0, 0, 0.87);
}

.v-card-text {
    color: rgba(0, 0, 0, 0.6);
}
</style>