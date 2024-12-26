<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

import SidenavItem from "./SidenavItem.vue";
import SidenavCard from "./SidenavCard.vue";


const store = useStore();
const isRTL = computed(() => store.state.isRTL);

const route = useRoute();
const getRoute = computed(() => {
  const routeArr = route.path.split("/");
  return routeArr[1];
});

const isEquiposOpen = ref(false);
const IsMaterialOpen = ref(false);
const isUsersOpen = ref(false);

const toggleEquipos = () => {
  isEquiposOpen.value = !isEquiposOpen.value;
  
};

const toggleMaterial = () => {
  IsMaterialOpen.value =!IsMaterialOpen.value;
};

const toggleUsers = () => {
  isUsersOpen.value = !isUsersOpen.value;
};
</script>


<template>
  <div
    class="collapse navbar-collapse w-auto h-auto h-100"
    id="sidenav-collapse-main"
  >
    <ul class="navbar-nav">
      <li class="nav-item">
        <sidenav-item
          to="/dashboard-default"
          :class="getRoute === 'dashboard-default' ? 'active' : ''"
          :navText="'Tablero Principal'"
        >
          <template v-slot:icon>
            <i class="ni ni-tv-2 text-primary text-sm "></i>
          </template>
        </sidenav-item>
      </li>

      <li class="nav-item">
        <div 
          @click="toggleUsers"
          class="nav-link"
          :class="{ 'active': getRoute === 'users' || isUsersOpen }"
        >
          <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
            <i class="fa fa-users text-success text-sm "></i>
          </div>
          <span class="nav-link-text ms-1">Usuarios</span>
          <ChevronDown v-if="!isUsersOpen" class="ml-auto" />
          <ChevronUp v-else class="ml-auto" />
        </div>
        <ul v-if="isUsersOpen" class="nav-item-dropdown">
          <li>
            <sidenav-item
              to="/users/access"
              :class="route.path === '/users/access' ? 'active' : ''"
              :navText="'Control de acceso'"
            >
              <template v-slot:icon>
                <i class="ni ni-bullet-list-67 text-success text-sm "></i>
              </template>
            </sidenav-item>
          </li>
          <li>
            <sidenav-item
              to="/users/add"
              :class="route.path === '/users/add' ? 'active' : ''"
              :navText="'Agregar usuarios'"
            >
              <template v-slot:icon>
                <i class="ni ni-fat-add text-success text-sm "></i>
              </template>
            </sidenav-item>
          </li>
          <li>
            <sidenav-item
              to="/users/control"
              :class="route.path === '/machineandteams/add' ? 'active' : ''"
              :navText="'Gestión de usuarios'"
            >
              <template v-slot:icon>
                <i class="fa fa-user text-success text-sm "></i>
              </template>
            </sidenav-item>
          </li>
        </ul>
      </li>

      <li class="nav-item">
        <div 
          @click="toggleEquipos"
          class="nav-link"
          :class="{ 'active': getRoute === 'machineandteams' || isEquiposOpen }"
        >
          <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
            <i class="ni ni-credit-card text-success text-sm "></i>
          </div>
          <span class="nav-link-text ms-1">Maquinaria y equipos</span>
          <ChevronDown v-if="!isEquiposOpen" class="ml-auto" />
          <ChevronUp v-else class="ml-auto" />
        </div>
        <ul v-if="isEquiposOpen" class="nav-item-dropdown">
          <li>
            <sidenav-item
              to="/machineandteams/list"
              :class="route.path === '/machineandteams/list' ? 'active' : ''"
              :navText="'Agregar Categoria'"
            >
              <template v-slot:icon>
                <i class="ni ni-bullet-list-67 text-success text-sm "></i>
              </template>
            </sidenav-item>
          </li>
          <li>
            <sidenav-item
              to="/machineandteams/add"
              :class="route.path === '/machineandteams/add' ? 'active' : ''"
              :navText="'Categorias'"
            >
              <template v-slot:icon>
                <i class="ni ni-fat-add text-success text-sm "></i>
              </template>
            </sidenav-item>
          </li>
          <li>
            <sidenav-item
              to="/Asserts"
              :class="route.path === '/Bienes' ? 'active' : ''"
              :navText="'Bienes '"
            >
              <template v-slot:icon>
                <i class="ni ni-fat-add text-success text-sm "></i>
              </template>
            </sidenav-item>
          </li>
        </ul>
      </li>

      <li class="nav-item">
        <div 
          @click="toggleMaterial"
          class="nav-link"
          :class="{ 'active': getRoute === 'matenimeito' || IsMaterialOpen }"
        >
        <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
          <i class="ni ni-settings text-info text-sm opacity-10"></i>
        </div>
          <span class="nav-link-text ms-1">Matenimiento</span>
          <ChevronDown v-if="!IsMaterialOpen" class="ml-auto" />
          <ChevronUp v-else class="ml-auto" />
        </div>
        <ul v-if="IsMaterialOpen" class="nav-item-dropdown">
          <li>
            <sidenav-item
              to="/matenimeito/list"
              :class="route.path === '/matenimeito/list' ? 'active' : ''"
              :navText="'Agregar Categoria'"
            >
              <template v-slot:icon>
                <i class="ni ni-bullet-list-67 text-success text-sm opacity-10"></i>
              </template>
            </sidenav-item>
          </li>
          <li>
            <sidenav-item
              to="/matenimeito/add"
              :class="route.path === '/matenimeito/add' ? 'active' : ''"
              :navText="'Categorias'"
            >
              <template v-slot:icon>
                <i class="ni ni-fat-add text-success text-sm opacity-10"></i>
              </template>
            </sidenav-item>
          </li>
          <li>
            <sidenav-item
              to="/Asserts"
              :class="route.path === '/Bienes' ? 'active' : ''"
              :navText="'Bienes '"
            >
              <template v-slot:icon>
                <i class="ni ni-fat-add text-success text-sm opacity-10"></i>
              </template>
            </sidenav-item>
          </li>
        </ul>
        <sidenav-item
          to="/virtual-reality"
          :class="getRoute === 'virtual-reality' ? 'active' : ''"
          :navText= "'Mantenimientos'"
        >
          <template v-slot:icon>
            <i class="ni ni-app text-info text-sm "></i>
          </template>
        </sidenav-item>
      </li>

      <li class="mt-12 nav-item">
        <h6
          class="text-xs ps-4 text-uppercase font-weight-bolder opacity-6"
          :class="isRTL ? 'me-5' : 'ms-2'"
        >
          PERFIL Y CONFIGURACIONES
        </h6>
      </li>

      <li class="nav-item">
        <sidenav-item
          to="/profile"
          :class="getRoute === 'profile' ? 'active' : ''"
          :navText="'Perfil'"
        >
          <template v-slot:icon>
            <i class="ni ni-single-02 text-dark text-sm "></i>
          </template>
        </sidenav-item>
      </li>

      <li class="nav-item">
        <sidenav-item
          to="/signin"
          :class="getRoute === 'signin' ? 'active' : ''"
          :navText="isRTL ? 'تسجيل الدخول' : 'Configuraciones'"
        >
          <template v-slot:icon>
            <i class="ni ni-single-copy-04 text-danger text-sm "></i>
          </template>
        </sidenav-item>
      </li>

      <li class="nav-item">
        <sidenav-item
          to="/signup"
          :class="getRoute === 'signup' ? 'active' : ''"
          :navText="'Cerrar sesión'"
        >
          <template v-slot:icon>
            <i class="ni ni-collection text-info text-sm "></i>
          </template>
        </sidenav-item>
      </li>
    </ul>
  </div>

  <div class="pt-3 mx-3 mt-3 sidenav-footer">
    <sidenav-card
      :card="{
        title: 'Need Help?',
        description: 'Please check our docs',
        links: [
          {
            label: 'Documentation',
            route: 'https://www.creative-tim.com/learning-lab/vue/overview/argon-dashboard/',
            color: 'dark',
          },
          {
            label: 'Buy now',
            route: 'https://www.creative-tim.com/product/vue-argon-dashboard-pro?ref=vadp',
            color: 'success',
          },
        ],
      }"
    />
  </div>
</template>

<style scoped>
.nav-item-dropdown {
  padding-left: 2rem;
  list-style-type: none;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: #67748e;
  transition: all 0.2s ease-in-out;
}

.nav-link:hover {
  background-color: rgba(199, 199, 199, 0.2);
  border-radius: 0.5rem;
}

.nav-link.active {
  background-color: #f6f9fc;
  color: #344767;
  font-weight: 600;
  box-shadow: 0 0 2rem 0 rgba(136, 152, 170, 0.15);
  border-radius: 0.5rem;
}
</style>