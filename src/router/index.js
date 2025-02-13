import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Users from "../views/Users.vue";
import Machineandteams from "../views/Billing.vue";
import VirtualReality from "../views/VirtualReality.vue";
import Index from "../views/Index.vue";
import Profile from "../views/Profile.vue";
import Signup from "../views/Signup.vue";
import Signin from "../views/Signin.vue";
import Password from "../views/password.vue";
import ResetPassword from "../views/resetpassword.vue";
import SaveCategory from "../views/Category/Save_Category.vue";
import SaveUser from "../views/Save_User.vue";
import Category from "../views/Category/Category.vue";
import PlanearMantenimiento from "../views/PlanearMantenimiento.vue";
import Bienes from "../views/Home/Bienes/Bienes.vue";
import Configuration from "../views/Configuration.vue";
import GestionActiviades from "../views/Matenimiento/GestionActiviades.vue";
import Detalles from "../views/Matenimiento/detalles.vue";
import ListOrden from "../views/Matenimiento/ListOrden.vue";
import Informacion from "../views/Matenimiento/Informacion/Informacion.vue";
import ReazliaInforme from "../views/Matenimiento/Informacion/ReazliaInforme.vue";
import ListAssets from "../views/Assets/ListAssets.vue";
import Assers from "../views/Assets/Assers.vue";
import AssetDetail from "../views/Assets/AssetDetail.vue";
import HistoryMateni from "../views/Matenimiento/History/HistoryMateni.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    redirect: "/dashboard-default",
  },
  {
    path: "/index",
    name: "Index",
    component: Index,
  },
  // Ruta para Bienes
  {
    path: "/bienes",
    name: "a",
    component: Bienes,
  },
  {
    path: "/child",
    name: "Child",
    component: Bienes,
  },
  {
    path: "/RecuperarContrase",
    name: "RecuperarContraseña",
    component: Password,
  },
  {
    path: "/ResetPassword",
    name: "ResetPassword",
    component: ResetPassword,
  },
  {
    path: "/dashboard-default",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/users",
    name: "Users",
    component: Users,
  },
  {
    path: "/users/control",
    name: "Gestión de Usuarios",
    component: SaveUser,
  },
  {
    path: "/users/add",
    name: "Agregar Usuarios",
    component: SaveUser,
  },
  {
    path: "/maquinariayequipos",
    name: "Maquinaria y Equipos",
    component: Machineandteams,
  },
  {
    path: "/machineandteams/list",
    name: "Guardar Campos",
    component: SaveCategory,
  },
  {
    path: "/machineandteams/add",
    name: "Consultar Categoría",
    component: Category,
  },
  {
    path: "/virtual-reality",
    name: "Virtual Reality",
    component: VirtualReality,
  },
  {
    path: "/assets",
    name: "Bienes",
    component: ListAssets,
  },
  {
path: "/history",
    name: "Historial",
    component: HistoryMateni
  },
  {
    path: "/assets/new",
    name: "CreateAsset",
    component: Assers
  },
  {
    path: "/assets/edit",
    name: "EditAsset",
    component: Assers
  },
  {
    path: "/assets/detail",
    name: "AssetDetail",
    component: AssetDetail
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
  },
  {
    path: "/signin",
    name: "Signin",
    component: Signin,
  },
  {
    path: "/signup",
    name: "Signup",
    component: Signup,
  },
  {
    path: "/mantenimientos",
    redirect: "/mantenimientos/planear-mantenimiento",
  },
  {
    path: "/mantenimientos/planear-mantenimiento",
    name: "Planear Mantenimiento",
    component: PlanearMantenimiento,
  },
  {
    path: "/mantenimientos/GestionActividaes",
    name: "Gestion",
    component: GestionActiviades,
  },
  {
    path: "/mantenimientos/ordenes-trabajo",
    name: "Ordenes de Trabajo",
    component: ListOrden,
  },
    {
  path: "/informes",
  name: "Informes",
  component: Informacion,
    },
  {
    path: "/ReazlziInforme",
    name: "asdasda",
    component: ReazliaInforme,
  },
  {
    path: "/mantenimientos/detalles",
    name: "Detalles",
    component: Detalles,
  },
  {
    path: "/configuration",
    name: "Configuration",
    component: Configuration,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "active",
});

export default router;
