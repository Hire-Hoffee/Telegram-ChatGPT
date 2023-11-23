import axios from "axios";
import FormData from "form-data";

class Text2ImageAPI {
  constructor(url, apiKey, secretKey) {
    this.URL = url;
    this.AUTH_HEADERS = {
      "X-Key": `Key ${apiKey}`,
      "X-Secret": `Secret ${secretKey}`,
    };
  }

  async getModel() {
    const response = await axios.get(this.URL + "key/api/v1/models", {
      headers: this.AUTH_HEADERS,
    });
    const data = response.data;
    return data[0].id;
  }

  async generate(prompt, model, images = 1, width = 1024, height = 1024) {
    const params = {
      type: "GENERATE",
      numImages: images,
      width: width,
      height: height,
      generateParams: {
        query: `${prompt}`,
      },
    };

    const formData = new FormData();
    formData.append("model_id", model);
    formData.append("params", JSON.stringify(params), { contentType: "application/json" });

    const response = await axios.post(this.URL + "key/api/v1/text2image/run", formData, {
      headers: { ...this.AUTH_HEADERS, ...formData.getHeaders() },
    });

    const data = response.data;
    return data.uuid;
  }

  async checkGeneration(requestId, attempts = 10, delay = 10) {
    while (attempts > 0) {
      const response = await axios.get(this.URL + "key/api/v1/text2image/status/" + requestId, {
        headers: this.AUTH_HEADERS,
      });
      const data = response.data;
      if (data.status === "DONE") {
        return data.images;
      }

      attempts -= 1;
      await new Promise((resolve) => setTimeout(resolve, delay * 1000));
    }
  }
}

async function chatRequestImageFusionBrain(content) {
  try {
    const api = new Text2ImageAPI(
      "https://api-key.fusionbrain.ai/",
      process.env.FUSION_BRAIN_KEY,
      process.env.FUSION_BRAIN_SECRET
    );

    const modelId = await api.getModel();
    const uuid = await api.generate(content, modelId);
    const image = (await api.checkGeneration(uuid))[0];
    const buffer = Buffer.from(image, "base64");

    return buffer;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

export { chatRequestImageFusionBrain };
