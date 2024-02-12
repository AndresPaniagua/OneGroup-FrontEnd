<template>
  <div class="vl-parent">
    <Loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="fullPage"
    />

    <div class="All_container">
      <div class="main__video">
        <div class="main__video-showVideo">
          <video
            ref="videoPlayer"
            controls
            @ended="loadNextVideoChunk"
            @timeupdate="checkPlaybackEnd"
            @error="handleVideoError"
          ></video>
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
import { ref } from "vue";
</script>

<script>
import Loading from "vue-loading-overlay";
import { getAllVideos, getVideoByIDAndPart } from "@/utils/connection";
import VideoList from "./VideoList.vue";
import "vue-loading-overlay/dist/css/index.css";

export default {
  data() {
    return {
      mainVideoURL: {},
      isLoading: false,
      fullPage: true,
      appIdentifier: "",
      currentChunkIndex: 0,
      videoChunks: ref([]),
    };
  },
  props: ["allVideos", "videosToShow"],
  components: {
    Loading,
    VideoList,
  },
  methods: {
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
          this.appIdentifier = response.videos[0].appIdentifier;
          this.loadMainVideo();
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
    handleVideoError(event) {
      console.error("Error loading video:", event.target.error);
    },
    async loadMainVideo() {
      try {
        if (!this.appIdentifier) {
          return;
        }

        const response = await getVideoByIDAndPart(
          this.appIdentifier,
          this.currentChunkIndex
        );
        const firstVideo = response.videos;
        this.mainVideoURL.title = firstVideo.title;
        this.mainVideoURL.description = firstVideo.description;

        const firstChunkData = Object.values(JSON.parse(firstVideo.chunks[0]));
        if (!firstChunkData || !firstChunkData.length) {
          console.error("No video chunks found.");
          return;
        }

        const chunkSize = 5000;
        const totalParts = Math.ceil(firstChunkData.length / chunkSize);
        // const chunkParts = [];

        for (let i = 0; i < totalParts; i++) {
          const startIndex = i * chunkSize;
          const endIndex = Math.min((i + 1) * chunkSize, firstChunkData.length);
          const part = firstChunkData.slice(startIndex, endIndex);
          // chunkParts.push(part);
          this.videoChunks.value = part;
          this.playVideo();
          await this.delay(2000);
        }

        // Actualizar el array de fragmentos de video con los datos recibidos del API
        // this.videoChunks.value = firstChunkData;

        // // Comenzar a reproducir el video progresivamente
        // this.playVideo();
      } catch (error) {
        console.error("Error loading video chunks:", error);
      }
    },
    playVideo() {
      const videoElement = this.$refs.videoPlayer;

      console.log(
        "Blob: ",
        new Blob([this.videoChunks.value], { type: "video/mp4" })
      );
      console.log("this.videoChunks.value: ", this.videoChunks.value);
      const mediaSource = new MediaSource();
      videoElement.src = URL.createObjectURL(mediaSource);

      mediaSource.addEventListener("sourceopen", async () => {
        try {
          const sourceBuffer = mediaSource.addSourceBuffer(
            'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
          );
          const firstChunk = this.videoChunks.value;
          const arrayBuffer = new Uint8Array(firstChunk).buffer;
          sourceBuffer.appendBuffer(arrayBuffer);
          console.log("sourceBuffer: ", sourceBuffer);
        } catch (error) {
          console.log("Error in sourceopen", error);
        }
      });

      console.log("videoElement: ", videoElement);
      console.log("mediaSource: ", mediaSource);

      // videoElement.play();
    },
    async loadNextVideoChunk() {
      try {
        if (this.currentChunkIndex >= this.videoChunks.value.length - 1) {
          console.log("No more video chunks available.");
          return;
        }

        const videoElement = this.$refs.videoPlayer;
        const playbackPoint = videoElement.duration * 0.8;

        console.log("videoElement: ", videoElement);

        if (videoElement.currentTime >= playbackPoint) {
          this.currentChunkIndex++;
          const nextChunk = this.videoChunks.value[this.currentChunkIndex];

          videoElement.src = URL.createObjectURL(
            new Blob([nextChunk], { type: "video/mp4" })
          );

          // videoElement.play();
        }
      } catch (error) {
        console.error("Error loading next video chunk:", error);
      }
    },
    checkPlaybackEnd() {
      const videoElement = this.$refs.videoPlayer;
      const playbackPoint = videoElement.duration * 0.8;
      if (videoElement.currentTime >= playbackPoint) {
        this.loadNextVideoChunk();
      }
    },
    async delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
  },
  mounted() {
    this.fetchVideos();
  },
};
</script>
