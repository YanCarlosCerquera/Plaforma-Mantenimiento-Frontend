<script setup>
import { ref, onMounted } from "vue";
import AuthorsTable from "./components/AuthorsTable.vue";
import apiService from "../service/apiService";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";

const token = Cookies.get("authToken");
const ruta = ref({
    name: "",
    route: "",
    state: true,
});
const rutaId = ref("");
const headers = ref([
    { text: "Nombre de la ruta", value: "ruta.name" },
    { text: "Descripción", value: "ruta.route" },
    { text: "Estado", value: "ruta.state" },
]);
const icons = ref({
    firstIcon: "fas fa-pen",
    secondIcon: "fas fa-trash",
});

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
const dialog = ref(false);
const isLoading = ref(false);

const fetchData = async () => {
    try {
        const response = await apiService.get(
            "/views",
            {},
            { Authorization: `Bearer ${token}` }
        );
        rows.value = response.map((view) => ({
            ...view,
            state: view.state ? view.state : "Inactivo",
        }));
    } catch (error) {
        console.error("Error fetching rols:", error);
        alert("Error al cargar los usuarios");
    }
};

const handleEdit = (row) => {
    ruta.value = { ...row };
    rutaId.value = row._id;
    dialog.value = true;
};
const handleCancel = () => {
    Object.keys(ruta.value).forEach((key) => (ruta.value[key] = ""));
    rutaId.value = "";
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
            title: "Ruta eliminado correctamente",
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
            state: ruta.value.state,
        };

        await apiService.patch(`views/${rutaId.value}`, data, {
            Authorization: `Bearer ${token}`,
        });

        Swal.fire({
            title: "Ruta editado exitosamente",
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

        handleCancel();

        await fetchData();
    } catch (error) {
        Swal.fire({
            title: "Error al editar ruta: ",
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

onMounted(async () => {
    await fetchData();
});
</script>

<template>
    <div class="py-4 container-fluid">
        <div class="row">
            <div class="col-12">
                <AuthorsTable :title="'Parametrización rutas'" :headers="headers" :rows="rows" :fields="fields"
                    :icons="icons" @edit="handleEdit" @delete="handleDelete" />
            </div>
        </div>
            <v-dialog v-model="dialog" :fullscreen="mobile" scrollable persistent max-width="800px">
            <v-card class="bg-white">
                <v-card-title class="card-title d-flex align-items-center justify-content-center text-h4 text-succes"
                    style="margin: 1rem">
                    Editar ruta
                </v-card-title>
                <v-card-text class="card-body p-3">
                    <v-container>
                        <form @submit.prevent="handleSubmit">
                            <div class="row">
                                    <div class="row" style="width: 100%">
                                        <div>
                                            <label for="example-text-input" class="form-control-label">Nombre
                                                del rol</label>
                                            <argon-input id="name" type="text" v-model="ruta.name" />
                                        </div>
                                        <div>
                                            <label for="example-text-input" class="form-control-label">URL</label>
                                            <argon-input id="url" type="text" v-model="ruta.route" />
                                        </div>
                                        <div>
                                            <label for="example-text-input" class="form-control-label">Estado</label>
                                            <argon-select id="state" :options="states"
                                                v-model="ruta.state" />
                                        </div>
                                    </div>
                            </div>
                            <v-card-actions class="d-flex justify-content-center mt-4"
                                style="gap: 60px; padding-top: 20px">
                                <button class="btn btn-danger" type="button" @click="handleCancel">
                                    Cancelar
                                </button>
                                <button class="btn btn-success" type="submit">Registrar</button>
                            </v-card-actions>
                        </form>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<style scoped>
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