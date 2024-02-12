<template>
  <div>
    <div class="videoListTitle">
      <h2 class="videosTitle">All videos</h2>
    </div>
    <div class="videoShowContainer">
      <div
        v-for="video in videos"
        :key="video._id"
        @click="handleVideoClick(video._id)"
        class="video-item"
      >
        <img
          :src="getThumbnailPath(video)"
          alt="Miniatura del Video"
          class="img-thumbnail"
        />
        <div class="video-info">
          <p class="video-title">{{ video.title }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import "@/assets/styles/VideoList.css";
import "vue-loading-overlay/dist/css/index.css";
</script>

<script>
export default {
  data() {
    return {};
  },
  props: ["videos", "loadVideo"],
  methods: {
    getThumbnailPath(video) {
      return video.thumbnailPath || "/images/default-thumbnail2.png";
    },
    handleVideoClick(videoId) {
      console.log("ID of the clicked video", videoId);
      this.loadVideo(videoId);
    },
  },
  mounted() {},
};
</script>
