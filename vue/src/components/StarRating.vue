<template>
  <div class="rating-container">
    <p v-if="average !== null" class="average">⭐ Moyenne : {{ average }} / 5</p>

    <div v-if="isConnected" class="stars">
      <span
        v-for="i in 5"
        :key="i"
        class="star"
        :class="{ active: i <= userRating || (hover >= i && hover !== 0) }"
        @mouseenter="hover = i"
        @mouseleave="hover = 0"
        @click="submitRating(i)"
      >
        ★
      </span>
      <p v-if="userRating" class="user-note">Votre note : {{ userRating }} / 5</p>
    </div>

    <p v-else class="connect-hint">Connectez-vous pour noter ce film</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToken } from '@/stores/token';

const props = defineProps({
  filmId: Number,
  title: String,
  posterPath: String
});

const tokenStore = useToken();
const isConnected = !!tokenStore.token;

const average = ref(null);
const userRating = ref(null);
const hover = ref(0);

async function fetchAverage() {
  try {
    const res = await fetch(`/api/ratings/average/${props.filmId}`);
    const data = await res.json();
    average.value = data.average;
  } catch (error) {
    console.error('Erreur moyenne note :', error);
  }
}

async function fetchUserRating() {
  if (!isConnected) return;
  try {
    const res = await fetch(`/api/ratings/user/${props.filmId}`, {
      headers: {
        Authorization: `Bearer ${tokenStore.token}`
      }
    });
    const data = await res.json();
    userRating.value = data.rating;
  } catch (error) {
    console.error('Erreur note utilisateur :', error);
  }
}

async function submitRating(value) {
  try {
    const res = await fetch('/api/ratings/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStore.token}`
      },
      body: JSON.stringify({
        film_id: props.filmId,
        title: props.title,
        poster_path: props.posterPath,
        rating: value
      })
    });

    const data = await res.json();
    if (res.ok) {
      userRating.value = value;
      fetchAverage();
    } else {
      alert(data.message || 'Erreur lors de l’enregistrement de la note.');
    }
  } catch (error) {
    console.error('Erreur envoi note :', error);
  }
}

onMounted(() => {
  fetchAverage();
  fetchUserRating();
});
</script>

<style scoped>
.rating-container {
  text-align: center;
  margin-top: 1.5rem;
}

.stars {
  font-size: 1.8rem;
  user-select: none;
}

.star {
  cursor: pointer;
  color: #ccc;
  transition: color 0.2s ease;
}

.star.active {
  color: gold;
}

.average {
  font-weight: bold;
  margin-bottom: 0.3rem;
}

.user-note {
  margin-top: 0.3rem;
  font-size: 0.95rem;
  color: #666;
}

.connect-hint {
  font-style: italic;
  opacity: 0.7;
  margin-top: 0.5rem;
}
</style>
