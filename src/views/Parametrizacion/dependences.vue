<script setup>
import { ref, onMounted } from "vue";
import AuthorsTable from "../components/AuthorsTable.vue";
import apiService from "../../service/apiService";
import Swal from "sweetalert2";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonAutocomplete from "@/components/ArgonAutocomplete.vue";

const dependency = ref({
    name: "",
    state: true,
    TrainingCenterId: "",
    _id: "",
});
const dependencyId = ref("");
const headers = ref([
    { text: "Dependencia", value: "dependency.name" },
    { text: "Nombre del centro de Formación", value: "dependency.TrainingCenterId.name" },
    { text: "Regional", value: "dependency.TrainingCenterId.regional" },
]);

const fields = ref({
    name: {
        value: "name",
        class: "align-middle",
        textClass: "text-xs font-weight-bold mb-0",
    },
    trainingCenter: {
        value: "TrainingCenterId.name",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
    },
    regional: {
        value: "TrainingCenterId.regional",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
    },  
});

const rows = ref([]);
const trainingCenters = ref([]);
const dialog = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);

const fetchData = async () => {
    try {
        const response = await apiService.get("/dependece");
        rows.value = response.map((dep) => ({
            ...dep,
            state: dep.state ? "Activo" : "Inactivo",
        }));
    } catch (error) {
        console.error("Error fetching dependencies:", error);
        alert("Error al cargar las dependencias");
    }
};

const fetchTrainingCenters = async () => {
    try {
        const response = await apiService.get("/training-centers");
        trainingCenters.value = response.map((center) => ({
            value: center._id,
            title: center.name,
        }));
    } catch (error) {
        console.error("Error fetching training centers:", error);
        alert("Error al cargar los centros de formación");
    }
};

const handleEdit = (row) => {    
    dependency.value = { ...row };
    dependency.value.state = row.state === "Activo" ? true : false;
    dependency.value.TrainingCenterId = row.TrainingCenterId._id;
    dependencyId.value = row._id;
    isEditing.value = true;
    dialog.value = true;
};

const handleCancel = () => {
    Object.keys(dependency.value).forEach((key) => (dependency.value[key] = ""));
    dependencyId.value = "";
    isEditing.value = false;
    dialog.value = false;
};

const handleDelete = async (row) => {
    const result = await Swal.fire({
        title: "¿Estás seguro de que quieres eliminar esta dependencia?",
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
        await apiService.delete(`dependece/${row._id}`);
        Swal.fire({
            title: "Dependencia eliminada correctamente",
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
            title: "Error al eliminar dependencia.",
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

const handleSubmit = async () => {
    try {
        isLoading.value = true;

        const data = {
            name: dependency.value.name,
            state: dependency.value.state,
            TrainingCenterId: dependency.value.TrainingCenterId,
        };

        if (isEditing.value) {
            await apiService.patch(`dependece/${dependencyId.value}`, data);

            Swal.fire({
                title: "Dependencia editada exitosamente",
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
            await apiService.post("dependece", data);

            Swal.fire({
                title: "Dependencia creada exitosamente",
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
            title: "Error al " + (isEditing.value ? "editar" : "crear") + " dependencia: ",
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

const openCreateDialog = () => {
    dependency.value = {
        name: "",
        state: true,
        TrainingCenterId: "",
    };
    isEditing.value = false;
    dialog.value = true;
};

const icons = ref([
    { class: 'fas fa-edit', method: handleEdit },
    { class: 'fas fa-trash', method: handleDelete },
]);

onMounted(async () => {
    await fetchData();
    await fetchTrainingCenters();
});
</script>

<template>
    <div class="py-4 container-fluid">
        <div class="row">
            <div class="col-12">
                <AuthorsTable :title="'Dependencias'" :headers="headers" :rows="rows" :fields="fields"
                    :icons="icons">
                    <template #add-button>
                        <button class="btn btn-custom" @click="openCreateDialog">
                            <i class="fas fa-plus me-2"></i>Agregar Nueva Dependencia
                        </button>
                    </template>
                </AuthorsTable>
            </div>
        </div>

        <v-dialog v-model="dialog" :fullscreen="mobile" scrollable persistent max-width="800px">
            <v-card class="bg-white">
                <v-card-title class="card-title d-flex align-items-center justify-content-center text-h4 text-succes"
                    style="margin: 1rem">
                    {{ isEditing ? 'Editar dependencia' : 'Crear nueva dependencia' }}
                </v-card-title>
                <v-card-text class="card-body p-3">
                    <v-container>
                        <form @submit.prevent="handleSubmit">
                            <div class="row">
                                <div class="row" style="width: 100%">
                                    <div>
                                        <label for="example-text-input" class="form-control-label">Nombre de la dependencia</label>
                                        <argon-input id="name" type="text" v-model="dependency.name" />
                                    </div>
                                    <div>
                                        <label for="example-text-input" class="form-control-label">Selecciona un centro de formación</label>
                                        <ArgonAutocomplete id="TrainingCenterId" type="text" v-model="dependency.TrainingCenterId" :items="trainingCenters" />
                                    </div>
                                </div>
                            </div>
                            <v-card-actions class="d-flex justify-content-center mt-4"
                                style="gap: 60px; padding-top: 20px">
                                <button class="btn btn-danger" type="button" @click="handleCancel">
                                    Cancelar
                                </button>
                                <button class="btn btn-success" type="submit">
                                    {{ isEditing ? 'Guardar cambios' : 'Crear dependencia' }}
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
.btn-custom {
    background-color: white;
    color: #28a745;
    border: 1px solid #28a745;
    transition: all 0.3s ease;
    margin-bottom: 0%;
}

.btn-custom:hover {
    background-color: #28a745;
    color: white;
}

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