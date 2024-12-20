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

const toggleEquipos = () => {
  isEquiposOpen.value = !isEquiposOpen.value;
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
            <i class="ni ni-tv-2 text-primary text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>

      <li class="nav-item">
        <sidenav-item
          to="/users"
          :class="getRoute === 'users' ? 'active' : ''"
          :navText="isRTL ? 'الجداول' : 'Usuarios'"
        >
          <template v-slot:icon>
            <i class="ni ni-calendar-grid-58 text-warning text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>

      <li class="nav-item">
        <div 
          @click="toggleEquipos"
          class="nav-link"
          :class="{ 'active': getRoute === 'machineandteams' || isEquiposOpen }"
        >
          <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
            <i class="ni ni-credit-card text-success text-sm opacity-10"></i>
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
                <i class="ni ni-bullet-list-67 text-success text-sm opacity-10"></i>
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
                <i class="ni ni-fat-add text-success text-sm opacity-10"></i>
              </template>
            </sidenav-item>
          </li>
          <li>
            <sidenav-item
              to="/machineandteams/add"
              :class="route.path === '/machineandteams/add' ? 'active' : ''"
              :navText="'Bienes '"
            >
              <template v-slot:icon>
                <i class="ni ni-fat-add text-success text-sm opacity-10"></i>
              </template>
            </sidenav-item>
          </li>
        </ul>
      </li>

      <li class="nav-item">
        <sidenav-item
          to="/virtual-reality"
          :class="getRoute === 'virtual-reality' ? 'active' : ''"
          :navText="isRTL ? 'الواقع الافتراضي' : 'Mantenimientos'"
        >
          <template v-slot:icon>
            <i class="ni ni-app text-info text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>

      <li class="mt-12 nav-item">
        <h6
          class="text-xs ps-4 text-uppercase font-weight-bolder opacity-6"
          :class="isRTL ? 'me-4' : 'ms-2'"
        >
          PERFIL Y CONFIGURACIONES
        </h6>
      </li>

      <li class="nav-item">
        <sidenav-item
          to="/profile"
          :class="getRoute === 'profile' ? 'active' : ''"
          :navText="isRTL ? 'حساب تعريفي' : 'Perfil'"
        >
          <template v-slot:icon>
            <i class="ni ni-single-02 text-dark text-sm opacity-10"></i>
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
            <i class="ni ni-single-copy-04 text-danger text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>

      <li class="nav-item">
        <sidenav-item
          to="/signup"
          :class="getRoute === 'signup' ? 'active' : ''"
          :navText="isRTL ? 'اشتراك' : 'Cerrar sesión'"
        >
          <template v-slot:icon>
            <i class="ni ni-collection text-info text-sm opacity-10"></i>
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