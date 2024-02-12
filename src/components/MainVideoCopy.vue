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
            @timeupdate="handleTimeUpdate"
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
      videoSourceSRC: "",
      isLoading: false,
      fullPage: true,
      currentChunkIndex: 0,
      chunks: [],
      appIdentifier: "",
      mediaSource: null,
      sourceBuffer: null,
      currentIndex: 0,
      loadingChunks: false,
      bufferSize: 3,
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

      this.chunks.push(Object.values(JSON.parse(firstVideo.chunks[0])));
      this.currentIndex = 0;
      this.currentChunkIndex++;

      await this.loadAndShowNextChunks();

      // try {
      //   const response = await getVideoByIDAndPart(
      //     this.appIdentifier,
      //     this.currentChunkIndex
      //   );
      //   if (response.videos) {
      //     const firstVideo = response.videos;
      //     this.mainVideoURL.title = firstVideo.title;
      //     this.mainVideoURL.description = firstVideo.description;

      //     const buffer = Object.values(JSON.parse(firstVideo.chunks[0]));
      //     const arrayBuffer = this.convertChunkToArrayBuffer(buffer);

      //     if (arrayBuffer) {
      //       this.appendChunkToSourceBuffer(arrayBuffer);
      //       this.currentChunkIndex++;
      //     } else {
      //       throw new Error("Failed to convert chunk to ArrayBuffer");
      //     }
      //   }
      // } catch (error) {
      //   console.error("Error getting video id from API:", error);
      // }
    },
    convertChunkToArrayBuffer(chunk) {
      if (Array.isArray(chunk) && chunk.every(Number.isInteger)) {
        const uint8Array = new Uint8Array(chunk);
        return uint8Array.buffer;
      } else {
        console.error("El chunk no es un array de enteros:", chunk);
        return null;
      }
    },
    appendChunkToSourceBuffer(chunk) {
      try {
        if (this.sourceBuffer && !this.sourceBuffer.updating) {
          if (chunk instanceof ArrayBuffer) {
            this.sourceBuffer.appendBuffer(chunk);
            console.log("Buffer appended successfully.");
          } else {
            console.error("Invalid chunk type. Expected ArrayBuffer.");
          }
        } else {
          console.error("Source buffer is busy or unavailable.");
        }
      } catch (error) {
        console.error("Error appending buffer:", error);
      }
    },
    handleSourceOpen() {
      try {
        this.sourceBuffer = this.mediaSource.addSourceBuffer(
          'video/mp4; codecs="avc1.64002a,mp4a.40.2"; profiles="mp42,mp41"'
        );
        this.sourceBuffer.addEventListener("updateend", () => {
          console.log("Buffer update end.");
          console.log("sourceBuffer: ", this.sourceBuffer);
          if (this.currentChunkIndex < this.chunks.length) {
            this.loadMainVideo();
          }
        });
        console.log("Source buffer created successfully.");
        this.loadMainVideo();
      } catch (error) {
        console.error("Error creating source buffer:", error);
      }
    },
    async loadAndShowNextChunks() {
      if (this.loadingChunks || this.currentIndex >= this.chunks.length) return;

      this.loadingChunks = true;

      try {
        const response = await getVideoByIDAndPart(
          this.appIdentifier,
          this.currentChunkIndex
        );
        const firstVideo = response.videos;

        const nextChunks = Object.values(JSON.parse(firstVideo.chunks[0]));
        // const arrayBuffer = this.convertChunkToArrayBuffer(buffer);

        // const nextChunks = await this.getNextChunksFromAPI(this.bufferSize);
        console.log("nextChunks: ", nextChunks);
        console.log("this.chunks: ", this.chunks);
        this.chunks.push(...nextChunks);
        this.currentIndex += nextChunks.length;
        this.currentChunkIndex++;
        console.log("currentChunkIndex");

        this.showVideoFragments();
      } catch (error) {
        console.error("Error loading and showing next chunks:", error);
      } finally {
        this.loadingChunks = false;
      }
    },
    async showVideoFragments() {
      const videoPlayer = this.$refs.videoPlayer;
      console.log("showVideoFragments");

      if (
        videoPlayer.readyState >= videoPlayer.HAVE_CURRENT_DATA &&
        !videoPlayer.paused
      ) {
        while (this.currentIndex < this.chunks.length && !this.loadingChunks) {
          console.log("while");
          const chunk = this.chunks[this.currentIndex++];
          const blob = new Blob([chunk], { type: "video/mp4" });
          const videoURL = URL.createObjectURL(blob);

          const source = document.createElement("source");
          source.src = videoURL;
          videoPlayer.appendChild(source);

          videoPlayer.play();
        }
      }
    },
    handleTimeUpdate(event) {
      const videoPlayer = event.target;
      const buffered = videoPlayer.buffered;

      if (buffered.length > 0) {
        const currentTime = videoPlayer.currentTime;
        const bufferedEnd = buffered.end(buffered.length - 1);
        if (currentTime >= bufferedEnd - 2 && !this.loadingChunks) {
          this.loadAndShowNextChunks();
        }
      }
    },
  },
  mounted() {
    this.fetchVideos();
    // this.mediaSource = new MediaSource();
    // this.$refs.videoPlayer.src = URL.createObjectURL(this.mediaSource);
    // this.videoSourceSRC = URL.createObjectURL(this.mediaSource);
    // this.mediaSource.addEventListener("sourceopen", this.handleSourceOpen);
    // this.$refs.videoPlayer.addEventListener("ended", () => {
    //   console.log("Se termino la reproducción del video");
    //   this.mediaSource.endOfStream();
    //   this.mediaSource.close();
    // });
  },
};
</script>
