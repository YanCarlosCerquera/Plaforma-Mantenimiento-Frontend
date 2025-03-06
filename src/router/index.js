import { createRouter, createWebHistory } from "vue-router";
import AssetDetail from "../views/Assets/AssetDetail.vue";
import Assets from "../views/Assets/Assets.vue";
import detalles_Bien from "../views/Assets/Detalles.vue";
import ListAssets from "../views/Assets/ListAssets.vue";
import Machineandteams from "../views/Billing.vue";
import Category from "../views/Category/Category.vue";
import SaveCategory from "../views/Category/Save_Category.vue";
import Configuration from "../views/Configuration.vue";
import Control_User from "../views/Control_User.vue";
import Dashboard from "../views/Dashboard.vue";
import Index from "../views/Index.vue";
import GestionActiviades from "../views/Matenimiento/GestionActiviades.vue";
import HistoryMateni from "../views/Matenimiento/History/HistoryMateni.vue";
import ListOrden from "../views/Matenimiento/ListOrden.vue";
import Detalles from "../views/Matenimiento/detalles.vue";
import PlanearMantenimiento from "../views/PlanearMantenimiento.vue";
import Profile from "../views/Profile.vue";
import Roles from "../views/Parametrizacion/Roles.vue";
import Routes from "../views/Parametrizacion/Routes.vue";
import Save_User from "../views/Save_User.vue";
import Signin from "../views/Signin.vue";
import Signup from "../views/Signup.vue";
import Users from "../views/Users.vue";
import Password from "../views/password.vue";
import ResetPassword from "../views/resetpassword.vue";
import Bienes from "../views/Home/Bienes/Bienes.vue";
import Solicitudes from "../views/Home/Solicitudes/Solicitudes.vue";
import Ejecucioens from "../views/Matenimiento/Ordenes/Ejecucioens.vue";
import Maintenance from "../views/Matenimiento/Mantenimiento/Maintenance.vue";
import Informacion from "../views/Matenimiento/Informacion/Informacion.vue";
import RealizarInforme from "../views/Matenimiento/Informacion/RealizarInforme.vue";
import AssignmentRoutes from "../views/Parametrizacion/AssignmentRoutes.vue";
import GestionInformes from "../views/Matenimiento/Informacion/GestionInformes.vue";
import TecnicoGestion from "../views/Matenimiento/Mantenimiento/TecnicoGestion.vue";
import TrainingCenter from "../views/Parametrizacion/TrainingCenter.vue";
import Dependences from "../views/Parametrizacion/dependences.vue";
import ActionLog from "../views/Parametrizacion/ActionLog.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    redirect: "/index",
  },
  {
    path: "/index",
    name: "Index",
    component: Index,
  },
  // Ruta para Bienes
  {
    path: "/bienes",
    name: "bienes",
    component: Bienes,
  },
  {
    path: "/RecuperarContrase",
    name: "RecuperarContraseña",
    component: Password,
  },
  {
    path: "/rol",
    name: "Rol",
    component: Roles,
  },
  {
    path: "/ruta",
    name: "Ruta",
    component: Routes,
  },
  {
    path: "/centroEntrenamiento",
    name: "centro Entrenamiento",
    component: TrainingCenter,
  },
  {
    path: "/dependence",
    name: "Dependencia",
    component: Dependences,
  },
  {
    path: "/action-log",
    name: "ActionLog",
    component: ActionLog,
  },
  {
    path: "/assignmentRoutes",
    name: "permiso de rutas",
    component: AssignmentRoutes,
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
    path: "/users/access",
    name: "Control de accesso",
    component: Users,
  },
  {
    path: "/configuration",
    name: "Configuration",
    component: Configuration,
  },
  {
    path: "/users/control",
    name: "Gestion de usuarios",
    component: Control_User,
  },
  {
    path: "/users/add",
    name: "Agregar de usuarios",
    component: Save_User,
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
    component: Assets
  },
  {
    path: "/assets/edit",
    name: "EditAsset",
    component: Assets
  },
  {
    path: "/assets/detail",
    name: "AssetDetail",
    component: AssetDetail
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
    path: "/RealizarInforme",
    name: "asdasda",
    component: RealizarInforme,
  },
  {
    path: "/mantenimientos/detalles",
    name: "Detalles",
    component: Detalles,
  },
  {
    name: "detalles_Bien",
    path: "/detalles",
    component: detalles_Bien,
  },
  {
    name: "Consultar activo",
    path: "/activo",
    component: Bienes,
  },
  {
    name:"Consular Solicitudes",
    path:"/solicitud",
    component : Solicitudes
  },
  {
    name:"ejecu",
    path:"/eje",
    component : Ejecucioens
  },
  {
    name:"Mantenimetos",
    path:"/mantenimiento",
    component: Maintenance
  },
  {
    name:"Gestions Informes",
    path:"/gestiones",
    component: GestionInformes
  },
  {
    name:"Tecnicos Gestion",
    path:"/Tecnico",
    component : TecnicoGestion
  }
  
  
 
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "active",
});

export default router;