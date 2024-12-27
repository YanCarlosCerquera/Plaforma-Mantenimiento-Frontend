import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Users from "../views/Users.vue";
import Machineandteams from "../views/Billing.vue";
import VirtualReality from "../views/VirtualReality.vue";
import Index from "../views/Index.vue";
import Profile from "../views/Profile.vue";
import Signup from "../views/Signup.vue";
import Signin from "../views/Signin.vue";
import password from "../views/password.vue";
import Resetpassword from "../views/resetpassword.vue";
import Save_Category from "../views/Category/Save_Category.vue";
import Save_User from "../views/Save_User.vue";
import Category from "../views/Category/Category.vue";
import Assers from "../views/Assets/Assers.vue";
import Configuration from "../views/Configuration.vue";
import Control_User from "../views/Control_User.vue";

const routes = [
  {
    path: "/",
    name: "/",
    redirect: "/dashboard-default",
  },
  {
    path: "/index",
    name: "Index",
    component: Index,
  },
  {
    path: "/RecuperarContrase",
    name: "RecuperarContrase",
    component: password,
  },
  {
    path: "/ResetPassword",
    name: "ResetPassword",
    component: Resetpassword,
  },
  {
    path: "/dashboard-default",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/users/access",
    name: "Control de accesso",
    component: Users,
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
    name: "Consultar_Category",
    component: Save_Category,
  },
  {
    path:"/machineandteams/add",
    name:"Consultar_Category",
    component: Category,
  },
  {
    path: "/virtual-reality",
    name: "Virtual Reality",
    component: VirtualReality,
  },
  {
    path: "/Asserts",
    name: "Bienes",
    component: Assers,
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

