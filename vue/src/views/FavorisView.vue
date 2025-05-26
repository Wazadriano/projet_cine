<template>
  <div class="home-container">
    <h1>💖 Mes films favoris</h1>

    <div v-if="films.length" class="films-grid">
      <FilmCard v-for="film in films" :key="film.id" :film="film" />
    </div>
    <p v-else class="no-results">Aucun favori pour le moment.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import FilmCard from '@/components/FilmCard.vue';
import { useToken } from '@/stores/token';

const tokenStore = useToken();
const films = ref([]);

onMounted(async () => {
  try {
    const res = await fetch('/api/favorites/user', {
      headers: { Authorization: `Bearer ${tokenStore.token}` }
    });
    const data = await res.json();
    films.value = data;
  } catch (err) {
    console.error("Erreur chargement favoris :", err);
  }
});
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: auto;
  padding: 2rem;
  text-align: center;
}

.films-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  justify-content: center;
}

.no-results {
  font-style: italic;
  margin-top: 2rem;
  opacity: 0.7;
}
</style>
