<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

import Cookies from "js-cookie";
import { ChevronDown, ChevronUp } from "lucide-vue-next";
import { watch } from "vue";
import SidenavCard from "./SidenavCard.vue";
import SidenavItem from "./SidenavItem.vue";

const NavItemsEnum = {
  Mantenimientos: "Mantenimientos",
  Users: "Users",
};

const store = useStore();
const route = useRoute();
const router = useRouter();

const isEquiposOpen = ref(false);
const isNavItemOpen = ref({
  [NavItemsEnum.Users]: false,
  [NavItemsEnum.Mantenimientos]: false,
});

const toggleEquipos = () => {
  isEquiposOpen.value = !isEquiposOpen.value;
};

const toggleNavItem = (navItemKey) => {
  isNavItemOpen.value[navItemKey] = !isNavItemOpen.value[navItemKey];
};

const updateNavItemOpen = () => {
  isNavItemOpen.value = {
    [NavItemsEnum.Users]: route.path.startsWith("/users"),
    [NavItemsEnum.Mantenimientos]: route.path.startsWith("/mantenimientos"),
  };
};

const logout = () => {
  Cookies.remove("authToken");
  Cookies.remove("menu");
  router.push("/signin");
};

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
              <i class="ni ni-tv-2 text-primary text-sm"></i>
            </template>
          </sidenav-item>
        </li>

        <li class="nav-item">
          <div
            @click="toggleNavItem(NavItemsEnum.Users)"
            class="nav-link"
            :class="{
              active:
                routeName === 'users' || isNavItemOpen[NavItemsEnum.Users],
            }"
          >
            <div
              class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center"
            >
              <i class="fa fa-users text-success text-sm"></i>
            </div>
            <span class="nav-link-text ms-1">Usuarios</span>
            <ChevronDown
              v-if="!isNavItemOpen[NavItemsEnum.Users]"
              class="ml-auto"
            />
            <ChevronUp v-else class="ml-auto" />
          </div>
          <ul
            v-if="isNavItemOpen[NavItemsEnum.Users]"
            class="nav-item-dropdown"
          >
            <li>
              <sidenav-item
                to="/users/access"
                :class="route.path === '/users/access' ? 'active' : ''"
                :navText="'Control de acceso'"
              >
                <template v-slot:icon>
                  <i class="ni ni-bullet-list-67 text-success text-sm"></i>
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
                  <i class="ni ni-fat-add text-success text-sm"></i>
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
                  <i class="fa fa-user text-success text-sm"></i>
                </template>
              </sidenav-item>
            </li>
          </ul>
        </li>

        <li class="nav-item">
          <div
            @click="toggleEquipos"
            class="nav-link"
            :class="{
              active: routeName === 'machineandteams' || isEquiposOpen,
            }"
          >
            <div
              class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center"
            >
              <i class="ni ni-credit-card text-success text-sm"></i>
            </div>
            <span class="nav-link-text ms-1">Maquinarias</span>
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
                  <i class="ni ni-bullet-list-67 text-success text-sm"></i>
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
                  <i class="ni ni-fat-add text-success text-sm"></i>
                </template>
              </sidenav-item>
            </li>
            <li>
              <sidenav-item
                to="/assets"
                :class="route.path === '/Bienes' ? 'active' : ''"
                :navText="'Bienes '"
              >
                <template v-slot:icon>
                  <i class="ni ni-fat-add text-success text-sm"></i>
                </template>
              </sidenav-item>
            </li>
          </ul>
        </li>

        <li class="nav-item">
          <div
            @click="toggleNavItem(NavItemsEnum.Mantenimientos)"
            class="nav-link"
            :class="{
              active:
                routeName === 'mantenimientos' ||
                isNavItemOpen[NavItemsEnum.Mantenimientos],
            }"
          >
            <div
              class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center"
            >
              <i class="ni ni-settings text-info text-sm opacity-10"></i>
            </div>
            <span class="nav-link-text ms-1">Mantenimientos</span>
            <ChevronDown
              v-if="!isNavItemOpen[NavItemsEnum.Mantenimientos]"
              class="ml-auto"
            />
            <ChevronUp v-else class="ml-auto" />
          </div>
          <ul
            v-if="isNavItemOpen[NavItemsEnum.Mantenimientos]"
            class="nav-item-dropdown"
          >
            <li>
              <sidenav-item
                to="/mantenimientos/planear-mantenimiento"
                :class="
                  route.path === '/mantenimientos/planear-mantenimiento'
                    ? 'active'
                    : ''
                "
                :navText="'Planear Mantenimiento'"
              >
                <template v-slot:icon>
                  <i class="ni ni-bullet-list-67 text-success text-sm"></i>
                </template>
              </sidenav-item>
            </li>
            <li>
              <sidenav-item
                to="/mantenimientos/GestionActividaes"
                :class="
                  route.path === '/mantenimientos/planear-mantenimiento'
                    ? 'active'
                    : ''
                "
                :navText="'Gestion Actual'"
              >
                <template v-slot:icon>
                  <i class="ni ni-bullet-list-67 text-success text-sm"></i>
                </template>
              </sidenav-item>
            </li>
            <li>
              <sidenav-item
                to="/assets/new"
                :class="route.path === '/assets/new' ? 'active' : ''"
                :navText="'Agregar Bienes'"
              >
                <template v-slot:icon>
                  <i class="ni ni-bullet-list-67 text-success text-sm"></i>
                </template>
              </sidenav-item>
            </li>
          </ul>
        </li>

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
              <i class="ni ni-single-02 text-dark text-sm"></i>
            </template>
          </sidenav-item>
        </li>

        <li class="nav-item">
          <sidenav-item
            to="/configuration"
            :class="routeName === 'configuration' ? 'active' : ''"
            :navText="isRTL ? 'تسجيل الدخول' : 'Configuraciones'"
          >
            <template v-slot:icon>
              <i class="ni ni-single-copy-04 text-danger text-sm"></i>
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
              <i class="ni ni-collection text-info text-sm"></i>
            </template>
          </sidenav-item>
        </li>
      </ul>
    </div>
  </div>

  <!-- Footer fuera del área scrollable -->
  <div class="pt-3 mx-3 mt-3 sidenav-footer">
    <sidenav-card
      :card="{
        title: 'Need Help?',
        description: 'Please check our docs',
        links: [
          {
            label: 'Documentation',
            route:
              'https://www.creative-tim.com/learning-lab/vue/overview/argon-dashboard/',
            color: 'dark',
          },
          {
            label: 'Buy now',
            route:
              'https://www.creative-tim.com/product/vue-argon-dashboard-pro?ref=vadp',
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

/* Estilos para el área scrollable */
.scrollable-nav-items {
  overflow-y: auto; /* Habilita el scroll vertical */
  max-height: calc(100vh - 200px); /* Ajusta la altura máxima */
}

/* Estilos para el footer */
.sidenav-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white; /* Ajusta el color de fondo según tu diseño */
  z-index: 1000; /* Asegura que el footer esté por encima del contenido */
  padding: 1rem; /* Ajusta el padding según sea necesario */
}
</style>
