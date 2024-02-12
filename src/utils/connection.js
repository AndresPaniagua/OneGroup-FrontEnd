import axios from "axios";

const urlAPI = window.URL_API;

export const getAllVideos = async () => {
  const result = { success: false, videos: null, error: null };
  try {
    const response = await axios.get(`${urlAPI}/videos`);

    result.success = response.data.success;
    result.videos = response.data.videos;
  } catch (error) {
    result.error = error.message;
  }

  return result;
};

export const getVideoByID = async (id) => {
  const result = { success: false, videos: null, error: null };
  try {
    const formData = new FormData();
    formData.append("AppIdentifier", id);

    const response = await axios.post(`${urlAPI}/videoID`, formData);

    result.success = response.data.success;
    result.videos = response.data.videos;
  } catch (error) {
    result.error = error.message;
  }

  return result;
};

export const uploadVideoPerChunks = async (
  title,
  description,
  chunk,
  chunkPart,
  id
) => {
  const result = { success: false, video: null, error: null };
  try {
    const response = await axios.post(`${urlAPI}/uploadChunks`, {
      appVideoIdentifier: id,
      title: title,
      description: description,
      chunkPart: chunkPart,
      videoChunks: chunk,
    });

    result.success = response.data.success;
    result.video = response.data.video;
  } catch (error) {
    result.error = error.message;
  }

  return result;
};

export const getVideoByIDAndPart = async (id, part) => {
  const result = { success: false, videos: null, error: null };
  try {
    const formData = new FormData();
    formData.append("AppIdentifier", id);
    formData.append("part", part);

    const response = await axios.post(`${urlAPI}/getVideosByIDAndPart`, formData);

    result.success = response.data.success;
    result.videos = response.data.videos;
  } catch (error) {
    result.error = error.message;
  }

  return result;
};
