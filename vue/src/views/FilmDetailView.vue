<template>
  <div class="film-detail-container" v-if="film">
    <div class="film-info">
      <img :src="'https://image.tmdb.org/t/p/w500' + film.poster_path" :alt="film.title" />

      <div class="film-text">
        <h1>{{ film.title }}</h1>

        <p>
          <strong>Note moyenne :</strong>
          {{ film.vote_average ? film.vote_average.toFixed(1) : 'N/A' }} / 10
        </p>

        <p>
          <strong>Date de sortie :</strong>
          {{ film.release_date || 'Inconnue' }}
        </p>

        <p class="overview">
          <strong>Résumé :</strong><br />
          {{ film.overview || 'Aucun résumé disponible.' }}
        </p>
        <FormButton v-if="isLoggedIn" @click="openModal">Ajouter à ma liste </FormButton>

<AddToListModal
  v-if="film"
  :show="showModal"
  :film="film"
  @close="closeModal"
/>

      </div>
    </div>
  </div>
  <div v-else class="film-detail-container">
    <p>Chargement du film...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useToken } from '@/stores/token';
import FormButton from '@/components/FormButton.vue';
import AddToListModal from '@/components/AddToListModal.vue';

const tokenstore = useToken();
const isLoggedIn = !!tokenstore.token;
const route = useRoute();
const filmId = route.params.id;
const film = ref(null);

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

async function fetchFilmDetails() {
  try {
    const responseFr = await fetch(`https://api.themoviedb.org/3/movie/${filmId}?language=fr-FR`, {
      headers: {
        Authorization: `Bearer ${TMDB_TOKEN}`,
        'Content-Type': 'application/json;charset=utf-8',
      },
    });

    const dataFr = await responseFr.json();

    if (!dataFr.overview || dataFr.overview.trim() === '') {
      const responseEn = await fetch(`https://api.themoviedb.org/3/movie/${filmId}?language=en-US`, {
        headers: {
          Authorization: `Bearer ${TMDB_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8',
        },
      });

      const dataEn = await responseEn.json();
      dataFr.overview = dataEn.overview || 'Résumé indisponible.';
    }

    film.value = dataFr;
  } catch (error) {
    console.error('Erreur chargement film:', error);
  }
}

// async function addToList() {
//   try {
//     const response = await fetch('http://localhost:5000/api/lists/add', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${tokenstore.token}`
//       },
//       body: JSON.stringify({
//         film_id: film.value.id,
//         title: film.value.title,
//         poster_path: film.value.poster_path
//       })
//     });

//     const data = await response.json();

//     if (response.ok) {
//       alert('Film ajouté à votre liste ✅');
//     } else {
//       alert(data.message || 'Erreur lors de l’ajout.');
//     }
//   } catch (error) {
//     console.error('Erreur :', error);
//     alert('Erreur de connexion serveur');
//   }
// }

const showModal = ref(false);
function openModal() {
  showModal.value = true;
}
function closeModal() {
  showModal.value = false;
}

onMounted(fetchFilmDetails);
</script>


<style scoped>
.film-text h1 {
  margin-bottom: 1rem;
  color: var(--color-heading);
}

.film-text p {
  margin-bottom: 1rem;
  color: var(--color-text);
  font-size: 1rem;
  line-height: 1.6;
}

.overview {
  white-space: pre-line;
}
</style>
