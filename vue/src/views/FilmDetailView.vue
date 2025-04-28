<template>
  <div v-if="film" class="film-detail-container">
    <h1>{{ film.title }}</h1>

    <div class="film-info">
      <img
        v-if="film.poster_path"
        :src="'https://image.tmdb.org/t/p/w500' + film.poster_path"
        :alt="film.title"
      />
      <div class="film-text">
        <p><strong>Date de sortie :</strong> {{ film.release_date }}</p>
        <p><strong>Note moyenne :</strong> {{ film.vote_average }}/10</p>
        <p><strong>Résumé :</strong> {{ film.overview }}</p>
      </div>
    </div>
  </div>

  <div v-else>
    <p>Chargement...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const filmId = route.params.id

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN

const film = ref(null)

async function fetchFilmDetails() {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${filmId}?language=fr-FR`, {
      headers: {
        Authorization: `Bearer ${TMDB_TOKEN}`,
        'Content-Type': 'application/json;charset=utf-8'
      }
    })

    const data = await response.json()
    film.value = data
  } catch (error) {
    console.error('Erreur chargement film:', error)
  }
}

onMounted(() => {
  fetchFilmDetails()
})
</script>
