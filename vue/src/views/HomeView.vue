<template>
  <div class="home-container">
    <h1>Films Populaires 🎬</h1>

    <div class="movies-grid">
      <div v-for="movie in paginatedMovies" :key="movie.id" class="movie-card">
        <RouterLink :to="`/film/${movie.id}`">
          <img
            v-if="movie.poster_path"
            :src="'https://image.tmdb.org/t/p/w300' + movie.poster_path"
            :alt="movie.title"
          />
          <h3>{{ movie.title }}</h3>
        </RouterLink>
      </div>
    </div>

    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">⬅️ Précédent</button>
      <span>Page {{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Suivant ➡️</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN

const allMovies = ref([])
const currentPage = ref(1)
const moviesPerPage = 10
const totalPages = 3

const paginatedMovies = computed(() => {
  const start = (currentPage.value - 1) * moviesPerPage
  const end = start + moviesPerPage
  return allMovies.value.slice(start, end)
})

async function fetchPopularMovies() {
  try {
    const response = await fetch('https://api.themoviedb.org/3/movie/popular?language=fr-FR', {
      headers: {
        Authorization: `Bearer ${TMDB_TOKEN}`,
        'Content-Type': 'application/json;charset=utf-8'
      }
    })

    const data = await response.json()
    allMovies.value = data.results.slice(0, 30)
  } catch (error) {
    console.error('Erreur API TMDb:', error)
  }
}

function nextPage() {
  if (currentPage.value < totalPages) {
    currentPage.value++
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

onMounted(() => {
  fetchPopularMovies()
})
</script>
