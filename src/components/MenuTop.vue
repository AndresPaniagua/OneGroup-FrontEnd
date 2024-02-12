<template>
  <nav>
    <div class="searchContainer">
      <div class="searchContainer__internal">
        <input
          type="text"
          placeholder="Type the name of the video"
          class="searchVideos"
          @input="searchVideoName"
        />
        <div class="iconSearchVideos">
          <span class="material-icons">search</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import "@/assets/styles/MenuTop.scss";
import "vue-loading-overlay/dist/css/index.css";
</script>

<script>
export default {
  data() {},
  props: ["allVideos", "videosToShow"],
  methods: {
    async searchVideoName(event) {
      const searchTerm = event.target.value;
      const filtered = this.allVideos.filter((video) => {
        return video.title.toLowerCase().startsWith(searchTerm.toLowerCase());
      });

      this.$emit("update:videosToShow", filtered);
    },
  },
};
</script>
