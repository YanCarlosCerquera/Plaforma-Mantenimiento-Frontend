<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import Swal from 'sweetalert2';

import SidenavItem from "./SidenavItem.vue";
import { watch } from "vue";
import { ChevronDown } from "lucide-vue-next";
import { ChevronUp } from "lucide-vue-next";
import Cookies from 'js-cookie'

const NavItemsEnum = {
  Mantenimientos: 'Mantenimientos',
  Users: 'Users',
  Inventario: 'Inventario', 
};

const store = useStore();
const route = useRoute();
const router = useRouter();

const isNavItemOpen = ref({
  [NavItemsEnum.Users]: false,
  [NavItemsEnum.Mantenimientos]: false,
  [NavItemsEnum.Inventario]: false,
});

const menuData = ref(null);
const role = ref('');


const toggleNavItem = (navItemKey) => {
  isNavItemOpen.value[navItemKey] = !isNavItemOpen.value[navItemKey];
};

const updateNavItemOpen = () => {
  isNavItemOpen.value = {
    [NavItemsEnum.Users]: route.path.startsWith('/users'),
    [NavItemsEnum.Mantenimientos]: route.path.startsWith('/mantenimientos'),
    [NavItemsEnum.Inventario]: route.path.startsWith('/assets'), 
  };
};

const logout = () => {
  Swal.fire({
    title: '¿Estás seguro?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, cerrar sesión',
    cancelButtonText: 'Cancelar',
    customClass: {
      title: "text-succes",
      confirmButton: "btn-success",
      cancelButton: "btn-danger",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      Cookies.remove("authToken");
      Cookies.remove("menu");
      store.commit("setAuthToken", null);
      router.push("/signin");
    }
  });
}

// Parsear la cookie del menú al montar el componente
onMounted(() => {
  const menuCookie = Cookies.get('menu');
  if (menuCookie) {
    const parsedMenu = JSON.parse(menuCookie);
    menuData.value = parsedMenu.menu;
    role.value = parsedMenu.role;
  }
});

watch(route.path, () => updateNavItemOpen());
const isRTL = computed(() => store.state.isRTL);
const routeName = computed(() => route.name);
</script>

<template>
  <div
    class="collapse navbar-collapse w-auto h-auto h-100"
    id="sidenav-collapse-main"
  >
    <!-- Contenedor scrollable hasta "Perfil y Configuraciones" -->
    <div class="scrollable-nav-items">
      <ul class="navbar-nav">
        <!-- Ítems del navbar -->
        <li class="nav-item">
          <sidenav-item
            to="/dashboard-default"
            :class="routeName === 'dashboard-default' ? 'active' : ''"
            :navText="'Tablero Principal'"
          >
            <template v-slot:icon>
              <i class="ni ni-tv-2 text-primary text-sm "></i>
            </template>
          </sidenav-item>
        </li>

        <!-- Menú dinámico basado en la cookie -->
        <template v-if="menuData">
          <li class="nav-item" v-for="(modulo, index) in menuData" :key="index">
            <div 
              @click="toggleNavItem(modulo.modulo)"
              class="nav-link"
              :class="{ 'active': isNavItemOpen[modulo.modulo] }"
            >
              <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                <i class="ni ni-box-2 text-info text-sm opacity-10"></i>
              </div>
              <span class="nav-link-text ms-1">{{ modulo.modulo }}</span>
              <ChevronDown v-if="!isNavItemOpen[modulo.modulo]" class="ml-auto" />
              <ChevronUp v-else class="ml-auto" />
            </div>
            <ul v-if="isNavItemOpen[modulo.modulo]" class="nav-item-dropdown">
              <li v-for="(view, viewIndex) in modulo.views" :key="viewIndex">
                <sidenav-item
                  :to="view.route"
                  :class="route.path === view.route ? 'active' : ''"
                  :navText="view.name"
                >
                  <template v-slot:icon>
                    <i class="ni ni-bullet-list-67 text-success text-sm "></i>
                  </template>
                </sidenav-item>
              </li>
            </ul>
          </li>
        </template>

        <!-- Sección de "Perfil y Configuraciones" -->
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
            :class="routeName === 'profile' ? 'active' : ''"
            :navText="'Perfil'"
          >
            <template v-slot:icon>
              <i class="ni ni-single-02 text-dark text-sm "></i>
            </template>
          </sidenav-item>
        </li>

        <!-- Mostrar "Configuraciones" solo si el rol es administrador -->
        <li class="nav-item" v-if="role === 'administrador'">
          <sidenav-item
            to="/configuration"
            :class="routeName === 'configuration' ? 'active' : ''"
            :navText="isRTL ? 'تسجيل الدخول' : 'Configuraciones'"
          >
            <template v-slot:icon>
              <i class="ni ni-single-copy-04 text-danger text-sm "></i>
            </template>
          </sidenav-item>
        </li>

        <li class="nav-item">
          <sidenav-item
            to=""
            @click="logout"
            :class="routeName === 'signup' ? 'active' : ''"
            :navText="'Cerrar sesión'"
          >
            <template v-slot:icon>
              <i class="ni ni-collection text-info text-sm "></i>
            </template>
          </sidenav-item>
        </li>
      </ul>
    </div>
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

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.scrollable-nav-items {
  overflow-y: auto; 
  max-height: calc(100vh - 200px);
}
</style>