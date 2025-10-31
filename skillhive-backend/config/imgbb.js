import axios from "axios";

const uploadToImgbb = async (fileBuffer, fileName) => {
  try {
    const base64 = fileBuffer.toString("base64");
    const res = await axios.post("https://api.imgbb.com/1/upload", null, {
      params: {
        key: process.env.IMGBB_API_KEY, // your API key from imgbb.com
        image: base64,
        name: fileName,
      },
    });
    return res.data.data.url; // return public image URL
  } catch (err) {
    console.error("❌ ImgBB upload failed:", err.response?.data || err.message);
    throw new Error("Image upload failed");
  }
};

export default uploadToImgbb;
