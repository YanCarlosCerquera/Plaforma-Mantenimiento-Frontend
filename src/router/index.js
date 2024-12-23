import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Users from "../views/Users.vue";
import Machineandteams from "../views/Billing.vue";
import VirtualReality from "../views/VirtualReality.vue";

import Profile from "../views/Profile.vue";
import Signup from "../views/Signup.vue";
import Signin from "../views/Signin.vue";
import password from "../views/password.vue";
import Resetpassword from "../views/resetpassword.vue";
import Save_Category from "../views/Category/Save_Category.vue";
import Save_User from "../views/Save_User.vue";

const routes = [
  {
    path: "/",
    name: "/",
    redirect: "/dashboard-default",
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
    path: "/users",
    name: "Gestionusuarios",
    component: Users,
  },
  {
    path: "/users_agregar",
    name: "Gestion de usuarios",
    component: Save_User,
  },
  { 
    path: "/maquinariayequipos",
    name: "Maquinaria y Equipos",
    component: Machineandteams,
  },
  {
    path: "/Agregar_Category",
    name: "Consultar Category",
    component: Save_Category,
  },
  {
    path: "/virtual-reality",
    name: "Virtual Reality",
    component: VirtualReality,
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
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "active",
});

export default router;
