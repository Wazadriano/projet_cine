
<template>
  <nav class="navbar">
    <div>
      <RouterLink to="/">Accueil</RouterLink>
      <RouterLink v-if="!tokenstore.token" to="/login">Connexion</RouterLink>
      <RouterLink v-if="!tokenstore.token" to="/register">Inscription</RouterLink>
      <RouterLink v-if="tokenstore.token" to="/profile">Mon Profil</RouterLink>
      <RouterLink v-if="tokenstore.token" to="/my-lists">Mes Listes</RouterLink>
      <RouterLink v-if="tokenstore.token" to="/favoris">Favoris</RouterLink>

    </div>

    <div v-if="tokenstore.token">
      <span class="welcome">Bienvenue {{ tokenstore.getLoggedUser() }}</span>
      <button @click="signout">Déconnexion</button>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useToken } from '@/stores/token'

const tokenstore = useToken()
const router = useRouter()

function signout() {
  tokenstore.clearToken()
  router.push('/login')
}
</script>

<style scoped>
.welcome {
  margin-right: 1rem;
  font-weight: bold;
}
button {
  background-color: var(--vt-c-indigo);
  color: var(--vt-c-white);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}
button:hover {
  background-color: #3c5b88;
}
</style>
