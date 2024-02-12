<template>
  <div>
    <form @submit.prevent="uploadVideoChunks" class="form">
      <label for="title" class="label">Video name:</label>
      <input
        type="text"
        id="title"
        v-model="videoTitle"
        required
        class="input"
      />

      <label for="description" class="label">Video description:</label>
      <textarea
        id="description"
        v-model="videoDescription"
        required
        class="textarea"
      ></textarea>

      <label for="videoFile" class="label">Select a video:</label>
      <input
        type="file"
        id="videoFile"
        ref="videoFile"
        accept="video/mp4"
        @change="handleFileChange"
        required
        class="input file-input"
      />

      <button type="submit" class="button">Upload video</button>
      <progress
        id="progressBar"
        :max="100"
        :value="progress"
        class="progress"
        :hidden="!showProgressBar"
      ></progress>
    </form>
  </div>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";
import "@/assets/styles/VideoPlayer.css";
</script>

<script>
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { uploadVideoPerChunks } from "@/utils/connection";

export default {
  data() {
    return {
      videoTitle: "",
      videoFile: null,
      videoUrl: "",
      progress: 0,
      showProgressBar: false,
    };
  },
  props: ["modalShow"],
  methods: {
    async handleFileChange(event) {
      let loader = this.$loading.show({
        container: this.$refs.formContainer,
        canCancel: false,
      });
      try {
        const file = event.target.files[0];
        const ffmpeg = new FFmpeg();
        await ffmpeg.load();

        await ffmpeg.writeFile("input.mp4", await fetchFile(file));

        await ffmpeg.exec([
          "-i",
          "input.mp4",
          "-vf",
          "scale=420:-1",
          "-c:a",
          "aac",
          "-b:a",
          "60k",
          "-c:v",
          "libx264",
          "-crf",
          "40", // Incrementa el factor de calidad (CRF) para una compresión más agresiva (valores más altos = mayor compresión)
          "-preset",
          "ultrafast",
          "output.mp4",
        ]);

        const data = await ffmpeg.readFile("output.mp4");
        const blobCompressVideo = new Blob([data.buffer], {
          type: "video/mp4",
        });
        const compressedFile = new File([blobCompressVideo], "compressed.mp4", {
          type: "video/mp4",
        });

        this.videoFile = compressedFile;
        console.log("Finished");
      } catch (error) {
        console.error("Error reading the selected file:", error);
      }
      loader.hide();
    },
    async uploadVideoChunks() {
      if (
        this.videoTitle === "" ||
        this.videoDescription === "" ||
        this.videoFile == null
      ) {
        this.$toast.open({
          message: "Please, fill all fields ❤🐐",
          type: "error",
          position: "top-right",
          duration: 5000,
        });
        return;
      }

      let loader = this.$loading.show({
        container: this.$refs.formContainer,
        canCancel: false,
      });
      this.showProgressBar = true;
      let chunkPart = 0;

      const chunkSize = 1024 * 1024;
      const fileReader = new FileReader();
      const videoFile = this.videoFile;
      let videoID = uuidv4();
      let offset = 0;

      fileReader.onload = async (event) => {
        try {
          const chunk = new Uint8Array(event.target.result);

          // Envía el fragmento al servidor
          const response = await uploadVideoPerChunks(
            this.videoTitle,
            this.videoDescription,
            chunk,
            chunkPart,
            videoID
          );

          if (!response.success) {
            throw new Error(response.error);
          }

          offset += chunkSize;
          this.progress = Math.round((offset / videoFile.size) * 100);

          if (offset < videoFile.size) {
            chunkPart += 1;
            readChunk(offset);
          } else {
            loader.hide();
            this.showProgressBar = false;
            this.videoTitle = "";
            this.videoDescription = "";
            this.$refs.videoFile.value = "";
            this.$toast.open({
              message: "Video saved successfully",
              type: "success",
              position: "top-right",
              duration: 5000,
            });
            this.$emit("update:modalShow", false);
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        } catch (error) {
          this.$toast.open({
            message: "Oops! Something went wrong.",
            type: "error",
            position: "top-right",
            duration: 5000,
          });
          loader.hide();
        }
      };

      function readChunk(offset) {
        const slice = videoFile.slice(offset, offset + chunkSize);
        fileReader.readAsArrayBuffer(slice);
      }

      readChunk(offset);
    },
    onCancel() {
      console.log("User cancelled the loader.");
    },
  },
};
</script>
