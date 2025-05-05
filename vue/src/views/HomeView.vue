<template>
  <div class="home-container">
    <h1>Films Populaires</h1>

    <div class="films-grid">
      <FilmCard
        v-for="film in films"
        :key="film.id"
        :film="film"
      />
    </div>

    <div class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">Précédent</button>
      <span>Page {{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">Suivant</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import FilmCard from '@/components/FilmCard.vue';

const films = ref([]);
const currentPage = ref(1);
const totalPages = 3;
const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

async function fetchFilms() {
  const response = await fetch(`https://api.themoviedb.org/3/movie/popular?language=fr-FR&page=${currentPage.value}`, {
    headers: {
      Authorization: `Bearer ${TMDB_TOKEN}`
    }
  });
  const data = await response.json();
  films.value = data.results;
}

function changePage(page) {
  currentPage.value = page;
  fetchFilms();
}

onMounted(fetchFilms);
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: auto;
  padding: 2rem;
}
.films-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.pagination {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
</style>
