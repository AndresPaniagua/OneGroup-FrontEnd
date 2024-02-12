<template>
  <aside :class="`${is_expanded ? 'is-expanded' : ''}`">
    <h3>Menu</h3>
    <div class="menu">
      <button title="Home" class="button" :onclick="homeButton">
        <span class="material-icons">home</span>
      </button>
      <button title="Add new video" class="button" :onclick="addVideoFile">
        <span class="material-icons">add_circle</span>
      </button>
    </div>

    <div class="flex"></div>

    <div class="menu">
      <button title="open settings" class="button" :onclick="settingsClick">
        <span class="material-icons">settings</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import "@/assets/styles/MenuLeft.scss";
import { ref } from "vue";
const is_expanded = ref(localStorage.getItem("is_expanded") === "true");
</script>

<script>
export default {
  data() {
    return {};
  },
  props: ["addVideoFile", "modalShow"],
  methods: {
    homeButton() {
      window.location.reload();
    },
    settingsClick() {
      this.$toast.open({
        message: "Oops!! This section is not yet available.",
        type: "warning",
        position: "top-right",
        duration: 5000,
      });
    },
  },
};
</script>
