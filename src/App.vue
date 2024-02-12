<template>
  <div id="app__internal">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :on-cancel="onCancel"
      :is-full-page="fullPage"
    />
    <div>
      <MenuLeft :addVideoFile="openSaveVideo" :modalShow="modalAddVideoShow" />
    </div>
    <div>
      <div class="navTop">
        <MenuTop
          :allVideos="allVideos"
          :videosToShow="videosToShow"
          @update:videosToShow="handleVideosShow"
        />
      </div>
      <MainVideoCopy
        :allVideos="allVideos"
        :videosToShow="videosToShow"
        @update:allVideos="handleAllVideosVar"
      />
    </div>
  </div>

  <!-- Modal -->
  <div v-if="modalAddVideoShow" class="modal">
    <div class="modal-contenido">
      <span @click="cerrarModal" class="cerrar">&times;</span>
      <h2>Upload video</h2>

      <VideoPlayer
        :modalShow="modalAddVideoShow"
        @update:modalShow="handleModalShowUpdate"
      />
    </div>
  </div>
</template>

<script setup>
import "@/assets/styles/App.css";
import "@/assets/styles/mediaQueries.css";
</script>

<script>
import MenuLeft from "@/components/MenuLeft.vue";
import MenuTop from "@/components/MenuTop.vue";
// import MainVideo from "@/components/MainVideo.vue";
import VideoPlayer from "@/components/VideoPlayer.vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";

import MainVideoCopy from "@/components/MainVideo.vue";

export default {
  data() {
    return {
      modalAddVideoShow: false,
      allVideos: [],
      videosToShow: [],
      isLoading: false,
      fullPage: true,
    };
  },
  components: {
    MenuLeft,
    MenuTop,
    // MainVideo,
    VideoPlayer,
    Loading,
    MainVideoCopy,
  },
  methods: {
    async openSaveVideo() {
      this.modalAddVideoShow = !this.modalAddVideoShow;
    },
    mostrarFormulario() {
      this.modalAddVideoShow = true;
    },
    cerrarModal() {
      this.modalAddVideoShow = false;
    },
    updateLoadingStatus(status) {
      this.isLoading = status;
    },
    handleModalShowUpdate(value) {
      this.modalAddVideoShow = value;
    },
    handleAllVideosVar(value) {
      this.allVideos = value;
      this.videosToShow = value;
    },
    handleVideosShow(value) {
      this.videosToShow = value;
    },
  },
};
</script>
