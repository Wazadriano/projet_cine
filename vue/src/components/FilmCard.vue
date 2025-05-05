<template>
  <RouterLink :to="`/film/${film.id}`" class="film-card">
    <img :src="'https://image.tmdb.org/t/p/w300' + film.poster_path" :alt="film.title" />
    <h3>{{ film.title }}</h3>
    <p>{{ film.vote_average.toFixed(1) }} ⭐</p>
  </RouterLink>
</template>

<script setup>
defineProps({ film: Object });
</script>

<style scoped>
.film-card {
  text-align: center;
  text-decoration: none;
  color: inherit;
}
.film-card img {
  border-radius: 10px;
  width: 100%;
  transition: transform 0.3s;
}
.film-card:hover img {
  transform: scale(1.05);
}
</style>
