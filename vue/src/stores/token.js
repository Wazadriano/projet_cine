import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useToken = defineStore("tokenStore", () => {
  const token = ref(localStorage.getItem("token") || null);
  const username = ref(localStorage.getItem("username") || null);

  const setToken = (newToken) => {
    token.value = newToken;
    localStorage.setItem("token", newToken);
  };

  const setUsername = (newUsername) => {
    username.value = newUsername;
    localStorage.setItem("username", newUsername);
  };

  const getLoggedUser = () => {
    return username.value || localStorage.getItem("username");
  };

  const clearToken = () => {
    token.value = null;
    username.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  };

  return {
    token,
    username,
    setToken,
    setUsername,
    getLoggedUser,
    clearToken,
  };
});
