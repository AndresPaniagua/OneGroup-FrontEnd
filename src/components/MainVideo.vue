<template>
  <div class="vl-parent">
    <Loading
      v-model:active="isLoading"
      :can-cancel="false"
      :on-cancel="onCancel"
      :is-full-page="fullPage"
    />

    <div class="All_container">
      <div class="main__video">
        <div class="main__video-showVideo">
          <video
            id="mainVideo"
            controls
            :src="videoSourceSRC"
            @error="handleVideoError"
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <div class="main__video-showDescription">
          <div class="titleVideo">
            <label>{{ mainVideoURL.title }}</label>
          </div>

          <div class="descriptionVideo">
            <article>
              {{ mainVideoURL.description }}
            </article>
          </div>
        </div>
      </div>
      <VideoList :videos="videosToShow" :loadVideo="loadMainVideo" />
    </div>
  </div>
</template>

<script setup>
import "@/assets/styles/MainVideo.css";
</script>

<script>
import Loading from "vue-loading-overlay";
import { getAllVideos, getVideoByID } from "@/utils/connection";
import VideoList from "./VideoList.vue";
import "vue-loading-overlay/dist/css/index.css";

export default {
  data() {
    return {
      mainVideoURL: {},
      videoSourceSRC: "",
      isLoading: false,
      fullPage: true,
    };
  },
  props: ["allVideos", "videosToShow"],
  components: {
    Loading,
    VideoList,
  },
  methods: {
    onCancel() {
      console.log("User cancelled the loader.");
    },
    async fetchVideos() {
      try {
        this.isLoading = true;
        const response = await getAllVideos();

        if (!response.success) {
          throw response.error;
        }

        this.$emit("update:allVideos", response.videos);
        // this.videosToShow = response.data.videos;

        if (response.videos.length > 0) {
          this.loadMainVideo(response.videos[0].appIdentifier);
        }

        setTimeout(() => {
          this.isLoading = false;
        }, 1000);
      } catch (error) {
        console.error("Error getting videos from API:", error);
        setTimeout(() => {
          this.isLoading = false;
        }, 1000);
      }
    },
    async loadMainVideo(id) {
      let loader = this.$loading.show({
        container: this.$refs.formContainer,
        canCancel: false,
      });

      try {
        const response = await getVideoByID(id);
        if (response.videos.length > 0) {
          const firstVideo = response.videos[0];
          this.mainVideoURL.title = firstVideo.title;
          this.mainVideoURL.description = firstVideo.description;

          const buffer = response.videos.flatMap((element) =>
            Object.values(JSON.parse(element.chunks[0]))
          );

          const concatenatedArrayBuffer = new Uint8Array(buffer);
          const blob = new Blob([concatenatedArrayBuffer], {
            type: "video/mp4",
          });
          const videoUrl = URL.createObjectURL(blob);
          this.videoSourceSRC = videoUrl;

          this.$toast.open({
            message: "Enjoy the video 😁",
            type: "success",
            position: "top-right",
            duration: 5000,
          });
        }
      } catch (error) {
        console.error("Error getting video id from API:", error);
        this.$toast.open({
          message: "Oops! Something went wrong loading video.",
          type: "error",
          position: "top-right",
          duration: 5000,
        });
      } finally {
        loader.hide();
      }
    },
    handleVideoError(event) {
      console.error("Error loading video:", event.target.error);
    },
  },
  mounted() {
    this.fetchVideos();
  },
};
</script>
