<script setup>
import { onBeforeUnmount, onBeforeMount, computed } from "vue";
import { useStore } from "vuex";
import AppFooter from "@/examples/PageLayout/Footer.vue";
import ArgonInput from "@/components/ArgonInput.vue";
// import ArgonCheckbox from "@/components/ArgonCheckbox.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
// import apiService from "../service/apiService";
// import { useRouter } from "vue-router";
import fondoImage2 from '../assets/image208.png';

const body = document.getElementsByTagName("body")[0];
const store = useStore();
// const router = useRouter();

const documentTypes = [

    { value: "Cédula de Ciudadanía", label: "Cédula de Ciudadanía" },
    { value: "Cédula de Extranjería", label: "Cédula de Extranjería" },
    { value: "Tarjeta de Identidad", label: "Tarjeta de Identidad" },
];

onBeforeMount(() => {
    store.state.hideConfigButton = true;
    store.state.showNavbar = false;
    store.state.showSidenav = false;
    store.state.showFooter = false;
    body.classList.remove("bg-gray-100");
});

onBeforeUnmount(() => {
    store.state.hideConfigButton = false;
    store.state.showNavbar = true;
    store.state.showSidenav = true;
    store.state.showFooter = true;
    body.classList.add("bg-gray-100");
});

const backgroundStyle = computed(() => ({
    backgroundImage: `url(${fondoImage2})`,
    backgroundSize: 'stretch',
    backgroundPosition: 'top',
}));

</script>

<template>
    <div class="container top-0 position-sticky z-index-sticky">
        <div class="row"></div>
    </div>
    <main class="main-content mt-0">
        <div class="page-header align-items-start min-vh-50 pt-5 pb-11 m-3 border-radius-lg" :style="backgroundStyle">
            <span class="mask bg-gradient-dark opacity-6"></span>
            <div class="container row">
                <div class="row justify-content-center mt-16">
                    <div class="col-lg-12 text-left mx-auto mt-16">


                        <h1 class="text-white mb-2 mt-12">Bienvenidos al sistema de gestión de inventarios de la
                            regional Huila</h1>
                    </div>
                </div>
            </div>
            <div class="container row d-flex justify-content-end">
                <ArgonButton color="success" class="my-4 mb-2 w-15">Iniciar Sesión</ArgonButton>
                <ArgonButton color="success" class="my-4 mb-2 w-15 mx-3">Registrarse</ArgonButton>
            </div>
        </div>

        <div class="page-header align-items-start pt-5 border-radius-lg">
            <div class="container row justify-end mr-5">
                <ArgonButton color="success" class="w-50 mr-16 fixed"><i
                        class="fa fa-database fa-4x position-static my-3 mr-10" aria-hidden="true"></i>
                    <p class="text-3xl font-weight-bold"> Consulta de bienes registrados</p>
                </ArgonButton>
                <div class="row justify-content-center mt-16">
                    <div class="col-lg-12 text-left mx-auto mt-16">
                    </div>

                </div>
            </div>
            <div class="container row d-flex justify-content-start">
                <ArgonButton color="success" class="w-50 ml-16 fixed"><i
                        class="fa fa-database fa-4x position-static my-3 mr-10" aria-hidden="true"></i>
                    <p class="text-3xl font-weight-bold"> Consulta el estado de tu solicitud</p>
                </ArgonButton>
            </div>
        </div>

        <div class="container-fluid w-90">
            <div class="card card-bg-gradient p-5 row-3 mx-auto">
                <h1 class="text-left text-green text-4xl font-weight-bold mb-7">Realiza tu solicitud de mantenimiento
                </h1>
                <form class="row">
                    <div class="form-group col-md-4">
                        <p class="text-left text-black text-xl font-weight-bold">Nombre del solicitante</p>
                        <ArgonInput id="email" type="email" placeholder="Nombre del solicitante" aria-label="Correo" />
                    </div>
                    <div class="form-group col-md-4">
                        <p class="text-left text-black text-xl font-weight-bold">Número de teléfono</p>
                        <ArgonInput id="name" type="text" placeholder="Número de teléfono" aria-label="Nombre" />
                    </div>
                    <div class="form-group col-md-4">
                        <p class="text-left text-black text-xl font-weight-bold">Número de serie</p>
                        <ArgonInput id="name" type="text" placeholder="Número de serie" aria-label="Nombre" />
                    </div>
                    <div class="form-group col-md-12">
                        <p class="text-left text-black text-xl font-weight-bold ">Descripción falla presentada</p>
                        <ArgonInput class="height-input" id="numberDocument" type="text"
                            placeholder="Descripción falla presentada" aria-label="Numero de documento" />
                    </div>
                    <div class="form-group col-md-6">
                        <p class="text-left text-black text-xl font-weight-bold">Código inventario</p>
                        <ArgonInput class="" id="numberDocument" type="text" placeholder="Descripción falla presentada"
                            style="height: 20px;" aria-label="Numero de documento" />
                    </div>
                    <div class="form-group col-md-6">
                        <p class="text-left text-black text-xl font-weight-bold">Tipo de documento</p>
                        <argon-select id="documentType" placeholder="Selecciona el tipo de documento"
                            name="documentType" size="lg" :options="documentTypes" />
                    </div>
                    <div class="text-center">
                        <argon-button type="submit" color="success" class="my-4 mb-2"
                            @clik="handleRegister">
                            Enviar solicitud
                        </argon-button>
                    </div>
                </form>
            </div>
        </div>



    </main>
    <app-footer />
</template>