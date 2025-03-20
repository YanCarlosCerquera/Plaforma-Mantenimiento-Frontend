<script setup>
import { ref, onMounted } from "vue";
import AuthorsTable from "../components/AuthorsTable.vue";
import apiService from "../../service/apiservice";
import Swal from "sweetalert2";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
import ArgonAutocomplete from "@/components/ArgonAutocomplete.vue";

const ruta = ref({
    name: "",
    route: "",
    description: "",
    moduloId: "",
    state: true,
});
const rutaId = ref("");
const headers = ref([
    { text: "Nombre de la ruta", value: "ruta.name" },
    { text: "URL", value: "ruta.route" },
    { text: "Estado", value: "ruta.state" },
]);

const states = [
    { value: true, label: "Activo" },
    { value: false, label: "Inactivo" },
];

const fields = ref({
    ruta: {
        value: "name",
        class: "align-middle",
        textClass: "text-xs font-weight-bold mb-0",
    },
    descripción: {
        value: "route",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
    },
    estado: {
        value: "state",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
    },
});

const rows = ref([]);
const modulos = ref([]);
const dialog = ref(false);
const isEditing = ref(false); // Nuevo estado para distinguir entre editar y crear
const isLoading = ref(false);

const fetchModulos = async () => {
    isLoading.value=true
    try {
        const response = await apiService.get(
            "/modulos",
            {},
        );
        modulos.value = response.map((modulo) => ({
            value: modulo._id,
            title: modulo.name,
        }));
    } catch (error) {
        console.error("Error fetching modulos:", error);
        alert("Error al cargar los modulos");
    }finally{
        isLoading.value=false
    }
}

const fetchData = async () => {
    isLoading.value=true
    try {
        const response = await apiService.get(
            "/views",
            {},
        );
        rows.value = response.map((view) => ({
            ...view,
            state: view.state ? "Activo" : "Inactivo",
        }));
    } catch (error) {
        console.error("Error fetching rols:", error);
        alert("Error al cargar los usuarios");
    }finally{
        isLoading.value=false
    }
};

const handleEdit = (row) => {
    ruta.value = { ...row };
    ruta.value.state = row.state === "Activo" ? true : false;
    ruta.value.moduloId = row.moduloId._id;
    rutaId.value = row._id;
    isEditing.value = true;
    dialog.value = true;
};

const handleCancel = () => {
    Object.keys(ruta.value).forEach((key) => (ruta.value[key] = ""));
    rutaId.value = "";
    isEditing.value = false;
    dialog.value = false;
};

const handleDelete = async (id) => {
    const result = await Swal.fire({
        title: "¿Estás seguro de que quieres eliminar esta ruta?",
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
        await apiService.delete(`views/${id}`);
        Swal.fire({
            title: "Ruta eliminada correctamente",
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
            title: "Error al eliminar ruta.",
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
            name: ruta.value.name,
            route: ruta.value.route,
            moduloId: ruta.value.moduloId,
            state: ruta.value.state,
        };

        if (isEditing.value) {
            await apiService.patch(`views/${rutaId.value}`, data,);

            Swal.fire({
                title: "Ruta editada exitosamente",
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
            await apiService.post(`views`, ruta.value, );

            Swal.fire({
                title: "Ruta creada exitosamente",
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
            title: "Error al " + (isEditing.value ? "editar" : "crear") + " ruta: ",
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
    ruta.value = {
        name: "",
        route: "",
        state: true,
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
    await fetchModulos()
});
</script>

<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <AuthorsTable :title="'Parametrización rutas'" :headers="headers" :rows="rows" :fields="fields"
                    :icons="icons" :loading="isLoading">
                    <template #add-button>
                        <button class="btn btn-custom" @click="openCreateDialog">
                            <i class="fas fa-plus me-2"></i>Agregar Nueva Ruta
                        </button>
                    </template>
                </AuthorsTable>
            </div>
        </div>

        <!-- Diálogo para crear/editar rutas -->
        <v-dialog v-model="dialog" :fullscreen="mobile" scrollable persistent max-width="800px">
            <v-card class="bg-white">
                <v-card-title class="card-title d-flex align-items-center justify-content-center text-h4 text-succes"
                    style="margin: 1rem">
                    {{ isEditing ? 'Editar ruta' : 'Crear nueva ruta' }}
                </v-card-title>
                <v-card-text class="card-body p-3">
                    <v-container>
                        <form @submit.prevent="handleSubmit">
                            <div class="row">
                                <div class="row" style="width: 100%">
                                    <div>
                                        <label for="example-text-input" class="form-control-label">Nombre
                                            de la ruta</label>
                                        <argon-input id="name" type="text" v-model="ruta.name" />
                                    </div>
                                    <div>
                                        <label for="example-text-input" class="form-control-label">Descripción</label>
                                        <argon-input id="description" type="text" v-model="ruta.description" />
                                    </div>
                                    <div>
                                        <label for="example-text-input" class="form-control-label">URL</label>
                                        <argon-input id="route" type="text" v-model="ruta.route" />
                                    </div>
                                    <div>
                                        <label for="example-text-input" class="form-control-label">Modulo</label>
                                        <ArgonAutocomplete id="moduloId" type="text" v-model="ruta.moduloId" :items="modulos"/>
                                    </div>
                                    <div>
                                        <label for="example-text-input" class="form-control-label">Estado</label>
                                        <argon-select id="state" :options="states" v-model="ruta.state" />
                                    </div>
                                </div>
                            </div>
                            <v-card-actions class="d-flex justify-content-center mt-4"
                                style="gap: 60px; padding-top: 20px">
                                <button class="btn btn-danger" type="button" @click="handleCancel">
                                    Cancelar
                                </button>
                                <button class="btn btn-success" type="submit">
                                    {{ isEditing ? 'Guardar cambios' : 'Crear ruta' }}
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
    color: #39A900;
    border: 1px solid #2d8000;
    transition: all 0.3s ease;
    margin-bottom: 0%;
}

.btn-custom:hover {
    background-color: #2d8000;
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