<script setup>
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";
import AuthorsTable from "../components/AuthorsTable.vue";
import apiService from "../../service/apiservice";

const headers = ref([
    { text: "Nombre usuario", value: "actionLog.userId.name" },
    { text: "Rol", value: "actionLog.userId.assignedRol.name" },
    { text: "Fecha de acción", value: "actionLog.date" },
    { text: "Hora de acción", value: "actionLog.time" },
    { text: "Acción", value: "actionLog.action" },
    { text: "Modulo", value: "actionLog.moduloId.name" },
]);

const fields = ref({
    user: {
        value: "userId.name",
        class: "align-middle",
        textClass: "text-xs font-weight-bold mb-0",
    },
    rol: {
        value: "userId.assignedRol.name",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
    },
    date: {
        value: "date",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
    },
    time: {
        value: "time",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
    },
    action: {
        value: "action",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
    },
    module: {
        value: "moduloId.name",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
    },
});

const rows = ref([]);

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return date.toLocaleDateString('es-ES', options);
};

const formatTime = (dateString) => {
    const date = new Date(dateString);
    const options = { hour: '2-digit', minute: '2-digit' };
    return date.toLocaleTimeString('es-ES', options);
};

const handleDelete = async (row) => {
    const result = await Swal.fire({
        title: "¿Estás seguro de que quieres eliminar este registro?",
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
        await apiService.delete(`action-log/${row._id}`);
        Swal.fire({
            title: "Registro eliminado correctamente",
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
            title: "Error al eliminar rol.",
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

const fetchData = async () => {
    try {
        const response = await apiService.get(
            "/action-log",
            {},
        );
        rows.value = response.map((action) => ({
            ...action,
            date: formatDate(action.dateTime),
            time: formatTime(action.dateTime),
        }));
    } catch (error) {
        console.error("Error fetching rols:", error);
        alert("Error al cargar los usuarios");
    }
};

const icons = ref([
{ class: 'fas fa-trash', method: handleDelete },
]);

onMounted(async () => {
    await fetchData();
});
</script>

<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <AuthorsTable :title="'Historial de acciones'" :headers="headers" :rows="rows" :fields="fields"
                :icons="icons" />
            </div>
        </div>
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