<script setup>
import { onMounted, ref } from 'vue';
import AuthorsTable from './AuthorsTable.vue';
import apiService from '../../service/apiservice';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

const loading = ref(false);
const word_ordens = ref([]);
const word_informes = ref([]);
const activeTab = ref('ordenes');

// Paginación para órdenes
const currentPageOrdens = ref(1);
const totalPagesOrdens = ref(1);
const itemsPerPage = 10; // Número de elementos por página

// Paginación para informes
const currentPageInformes = ref(1);
const totalPagesInformes = ref(1);

const props = defineProps({
    userData: {
        type: Object,
        required: true,
    }
});

const headers_ordens = ref([
    'Maquinaria y/o equipo',
    'Ubicación',
    'Fecha de asignación',
    'Fecha limite de ejecución',
    'Estado',
]);
const headers_informes = ref([
    'Informe',
    'Código inventario',
    'Horas',
    'Costo',
    'Trabajo realizado',
    'Ejecutado por',
]);

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${day}.${month}.${year} - ${formattedHours}.${minutes} ${ampm}`;
};

const getEstado = (state, prioridad) => {
    if (state) {
        return 'Ejecutada';
    } else if (!state && prioridad) {
        return 'Vencida';
    } else {
        return 'Sin ejecutar';
    }
};

const getEstadoClass = (estado) => {
    if (estado === 'Ejecutada') {
        return 'estado-ejecutada';
    } else if (estado === 'Vencida') {
        return 'estado-vencida';
    } else {
        return 'estado-sin-ejecutar';
    }
};

const fields_ordens = ref({
    maquinaria: {
        showAvatar: true,
        avatar: "solicitud.asset.image",
        main: "solicitud.asset.name",
    },
    ubicacion: {
        value: 'solicitud.asset.location',
        class: 'align-middle',
        textClass: 'text-xs font-weight-bold',
    },
    fecha_asignacion: {
        value: (row) => formatDate(row.fechaInicio),
        class: 'align-middle',
        textClass: 'text-xs font-weight-bold',
    },
    fecha_limite: {
        value: (row) => formatDate(row.fechaFin),
        class: 'align-middle',
        textClass: 'text-xs font-weight-bold',
    },
    state: {
        value: (row) => getEstado(row.state, row.prioridad),
        class: 'align-middle',
        textClass: 'text-xs font-weight-bold',
        customClass: (row) => getEstadoClass(getEstado(row.state, row.prioridad)),
    },
});

const fields_informes = ref({
    informe: {
        value: 'Informe',
        class: 'align-middle',
        textClass: 'text-xs font-weight-bold mb-0',
    },
    codigo_inventario: {
        value: 'orderId.solicitud.InventoryCode',
        class: 'align-middle',
        textClass: 'text-xs font-weight-bold',
    },
    horas: {
        value: 'hours',
        class: 'align-middle',
        textClass: 'text-xs font-weight-bold',
    },
    costo: {
        value: 'costs',
        class: 'align-middle',
        textClass: 'text-xs font-weight-bold',
    },
    trabajo_realizado: {
        value: 'workDone',
        class: 'align-middle',
        textClass: 'text-xs font-weight-bold',
    },
    ejecutado_por: {
        value: 'orderId.tecnicoId.name',
        class: 'align-middle',
        textClass: 'text-xs font-weight-bold',
    },
});

const normalizeText = (text) => {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const fetchWordOrdens = async (page = 1) => {
    try {
        loading.value = true;
        const { userId, role } = props.userData;
        let url = `/word-orden?limit=${itemsPerPage}&page=${page}`;
        
        if (role === 'Instructor' || role === 'técnico') {
            const normalizedRole = normalizeText(role); // Normalizar el rol
            url += `&${normalizedRole}Id=${userId}`;
        }

        const response = await apiService.get(url);
        
        // Verificar si la respuesta tiene la estructura esperada con data y meta
        if (response && response.data && response.meta) {
            word_ordens.value = response.data;
            totalPagesOrdens.value = response.meta.totalPages;
            currentPageOrdens.value = response.meta.page;
        } else {
            // Fallback para compatibilidad con versiones anteriores
            word_ordens.value = response;
            // Si no hay meta data, calcular el total de páginas basado en la longitud del array
            totalPagesOrdens.value = 1;
            currentPageOrdens.value = 1;
        }
        
        loading.value = false;
    } catch (error) {
        console.error('Error fetching ordens:', error);
        Swal.fire({
            title: "Error al cargar las ordenes",
            text: error.response?.data?.message || "Algo salió mal.",
            icon: "error",
            position: "bottom-right",
            toast: true,
            timer: 3000,
            background: "#dc3545",
            color: "white",
            iconColor: "white",
            showConfirmButton: false,
        });
        word_ordens.value = [];
        loading.value = false;
    }
};

const fetchWorkReports = async (page = 1) => {
    try {
        loading.value = true;
        const { userId, role } = props.userData;
        let url = `/work-report?limit=${itemsPerPage}&page=${page}`;
        
        if (role === 'Instructor' || role === 'técnico') {
            const normalizedRole = normalizeText(role); // Normalizar el rol
            url += `&${normalizedRole}Id=${userId}`;
        }

        const response = await apiService.get(url);
        
        // Verificar si la respuesta tiene la estructura esperada con data y meta
        if (response && response.data && response.meta) {
            word_informes.value = response.data;
            totalPagesInformes.value = response.meta.totalPages;
            currentPageInformes.value = response.meta.page;
        } else {
            // Fallback para compatibilidad con versiones anteriores
            word_informes.value = response;
            // Si no hay meta data, calcular el total de páginas basado en la longitud del array
            totalPagesInformes.value = 1;
            currentPageInformes.value = 1;
        }
        
        loading.value = false;
    } catch (error) {
        console.error('Error fetching work reports:', error);
        Swal.fire({
            title: "Error al cargar los informes",
            text: error.response?.data?.message || "Algo salió mal.",
            icon: "error",
            position: "bottom-right",
            toast: true,
            timer: 3000,
            background: "#dc3545",
            color: "white",
            iconColor: "white",
            showConfirmButton: false,
        });
        word_informes.value = [];
        loading.value = false;
    }
};

// Manejador para cambios de página en órdenes
const handlePageChangeOrdens = (page) => {
    currentPageOrdens.value = page;
    fetchWordOrdens(page);
};

// Manejador para cambios de página en informes
const handlePageChangeInformes = (page) => {
    currentPageInformes.value = page;
    fetchWorkReports(page);
};

const changeTab = (tab) => {
    activeTab.value = tab;
};

const handeDetailOrden = (row) => {
    const doc = new jsPDF();
    const rowData = row;

    doc.text('Detalle de la Orden de Trabajo', 10, 10);
    doc.text(`Maquinaria y/o equipo: ${rowData.solicitud.asset.name}`, 10, 20);
    doc.text(`Ubicación: ${rowData.solicitud.asset.location}`, 10, 30);
    doc.text(`Fecha de asignación: ${formatDate(rowData.fechaInicio)}`, 10, 40);
    doc.text(`Fecha limite de ejecución: ${formatDate(rowData.fechaFin)}`, 10, 50);
    doc.text(`Estado: ${getEstado(rowData.state, rowData.prioridad)}`, 10, 60);

    doc.save('detalle_orden_trabajo.pdf');
};

const handleDetailReporte = (row) => {
    const doc = new jsPDF();
    const rowData = row;

    doc.text('Detalle del Informe de Mantenimiento', 10, 10);
    doc.text(`Informe: ${rowData.orderId.radicado}`, 10, 20);
    doc.text(`Código inventario: ${rowData.orderId.solicitud.InventoryCode}`, 10, 30);
    doc.text(`Horas: ${rowData.hours}`, 10, 40);
    doc.text(`Costo: ${rowData.costs}`, 10, 50);
    doc.text(`Trabajo realizado: ${rowData.workDone}`, 10, 60);
    doc.text(`Ejecutado por: ${rowData.orderId.tecnicoId.name}`, 10, 70);

    doc.save('detalle_informe_mantenimiento.pdf');
};

const handleDeleteReporte = async (row) => {
    Swal.fire({
        title: '¿Estás seguro?',
        text: '¡No podrás revertir esto!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarlo!',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await apiService.delete(`/work-report/${row._id}`);
                await fetchWorkReports(currentPageInformes.value);
                Swal.fire({
                    title: "Reporte eliminado",
                    text: "El informe ha sido eliminado correctamente.",
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
            } catch (error) {
                console.error('Error deleting report:', error);
                Swal.fire({
                    title: "Error al eliminar el reporte",
                    text: error.response?.data?.message || "Algo salió mal.",
                    icon: "error",
                    position: "bottom-right",
                    toast: true,
                    timer: 3000,
                    background: "#dc3545",
                    color: "white",
                    iconColor: "white",
                    showConfirmButton: false,
                });
            }
        }
    });
};

const handeUpdateState = async (row) => {
    Swal.fire({
        title: '¿Desea cambiar el estado de la orden de trabajo?',
        text: '¡No podrás revertir esto!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cambiarlo!',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                // Cambiar el estado de la orden a true
                 await apiService.patch(`/word-orden/${row._id}`, {
                    state: true // Siempre se establece en true
                });

                // Actualizar la lista de órdenes
                await fetchWordOrdens(currentPageOrdens.value);

                Swal.fire({
                    title: "Estado cambiado",
                    text: "El estado de la orden ha sido actualizado correctamente.",
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
            } catch (error) {
                console.error('Error updating order state:', error);
                Swal.fire({
                    title: "Error al cambiar el estado de la orden",
                    text: error.response?.data?.message || "Algo salió mal.",
                    icon: "error",
                    position: "bottom-right",
                    toast: true,
                    timer: 3000,
                    background: "#dc3545",
                    color: "white",
                    iconColor: "white",
                    showConfirmButton: false,
                });
            }
        }
    });
};

const icons_ordens = ref([
    { class: "fa-solid fa-download", method: handeDetailOrden },
    { class: "fa-solid fa-search", method: handeUpdateState },
]);

const icons_reportes = ref([
    { class: "fa-solid fa-download", method: handleDetailReporte },
    { class: "fa-solid fa-trash", method: handleDeleteReporte },
]);

onMounted(async () => {
    await fetchWordOrdens(1);
    await fetchWorkReports(1);
});
</script>

<template>
    <div class="work-orders-container">
        <div class="header">
            <h2 class="title text-success">{{ activeTab === 'ordenes' ? 'Ordenes de trabajo' : 'Informe de mantenimiento' }}</h2>
            
            <div class="tab-switcher">
                <button 
                    :class="['tab-button', { active: activeTab === 'ordenes' }]" 
                    @click="changeTab('ordenes')"
                >
                    Ordenes
                </button>
                <button 
                    :class="['tab-button', { active: activeTab === 'informes' }]" 
                    @click="changeTab('informes')"
                >
                    Informes
                </button>
            </div>
        </div>
        
        <div class="tab-content">
            <div v-if="activeTab === 'ordenes'">
                <AuthorsTable
                    :fields="fields_ordens"
                    :headers="headers_ordens"
                    :rows="word_ordens"
                    :icons="icons_ordens"
                    :searchOption="false"
                    :exportOption="false"
                    :loading="loading"
                    @page-change="handlePageChangeOrdens"
                    :paginationData="{
                        totalPages: totalPagesOrdens,
                        currentPage: currentPageOrdens,
                        isServerPaginated: true
                    }"
                />
            </div>
            <div v-else>
                <AuthorsTable
                    :fields="fields_informes"
                    :headers="headers_informes"
                    :rows="word_informes"
                    :icons="icons_reportes"
                    :searchOption="false"
                    :exportOption="false"
                    :loading="loading"
                    @page-change="handlePageChangeInformes"
                    :paginationData="{
                        totalPages: totalPagesInformes,
                        currentPage: currentPageInformes,
                        isServerPaginated: true
                    }"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.work-orders-container {
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #39A900;
    margin: 0;
}

.tab-switcher {
    display: flex;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.tab-button {
    padding: 8px 20px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    font-size: 14px;
    transition: all 0.2s ease;
    background-color: white;
    color: #333;
}

.tab-button.active {
    background-color: #39A900;
    color: white;
}

.tab-content {
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
}

.estado-ejecutada {
    background-color: #e8f5e9;
    color: #39A900;
    padding: 4px 8px;
    border-radius: 4px;
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 600;
}

.estado-vencida {
    background-color: #fff8e1;
    color: #ff8f00;
    padding: 4px 8px;
    border-radius: 4px;
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 600;
}

.estado-sin-ejecutar {
    background-color: #ffebee;
    color: #c62828;
    padding: 4px 8px;
    border-radius: 4px;
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 600;
}

.options-buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
}

.download-btn, .search-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #6c757d;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
}

.download-btn:hover, .search-btn:hover {
    color: #2d8000;
}

/* Responsive styles */
@media (max-width: 768px) {
    .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }
    
    .tab-button {
        padding: 6px 15px;
        font-size: 0.9rem;
    }
    
    .title {
        font-size: 1.3rem;
    }
}
</style>