<template>
  <div class="home-container">
    <div class="search-header">
      <h1>Trouvez votre film !</h1>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher un film..."
        class="search-input"
      />
    </div>

    <div class="films-grid">
      <FilmCard
        v-for="film in films"
        :key="film.id"
        :film="film"
      />
    </div>

    <div class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
        Précédent
      </button>
      <span>Page {{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
        Suivant
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import FilmCard from '@/components/FilmCard.vue';

const films = ref([]);
const currentPage = ref(1);
const totalPages = 3;
const searchQuery = ref('');
const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

async function fetchFilms() {
  const response = await fetch(`https://api.themoviedb.org/3/discover/movie?language=fr-FR&page=${currentPage.value}`, {
    headers: {
      Authorization: `Bearer ${TMDB_TOKEN}`
    }
  });
  const data = await response.json();
  films.value = data.results;
}

watch(searchQuery, async (newQuery) => {
  if (newQuery.trim()) {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(newQuery)}&language=fr-FR&page=${currentPage.value}`, {
      headers: {
        Authorization: `Bearer ${TMDB_TOKEN}`
      }
    });
    const data = await response.json();
    films.value = data.results;
  } else {
    fetchFilms();
  }
});

function changePage(page) {
  currentPage.value = page;
  fetchFilms();
}

// const filteredFilms = computed(() => {
//   if (!searchQuery.value.trim()) return films.value;

//   const query = searchQuery.value.toLowerCase();

//   return films.value.filter((film) =>
//     film.title.toLowerCase().includes(query)
//   );
//  }
// );

onMounted(fetchFilms);
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: auto;
  text-align: center;
  padding: 2rem;
}

.search-header {
  margin-bottom: 2.5rem;
}

.search-header h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.search-input {
  display: block;
  margin: 0 auto;
  padding: 0.6rem 1rem;
  font-size: 1rem;
  width: 60%;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.films-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  justify-content: center;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}


.movie-card {
  width: 180px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
</style>
