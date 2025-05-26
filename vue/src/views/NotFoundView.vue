<template>
  <div class="form-container">
    <h1>404 - Page Introuvable</h1>
    <p>Désolé, la page que vous recherchez n'existe pas.</p>
    <RouterLink to="/">
      <button>Revenir à l'accueil</button>
    </RouterLink>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
