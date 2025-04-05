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

  async getPipeline() {
    const response = await axios.get(`${this.URL}key/api/v1/pipelines`, {
      headers: this.AUTH_HEADERS,
    });
    return response.data[0].id;
  }

  async generate(prompt, pipeline, images = 1, width = 1024, height = 1024) {
    const params = {
      type: "GENERATE",
      numImages: images,
      width: width,
      height: height,
      generateParams: {
        query: `${prompt}`,
      },
    };

    const form = new FormData();
    form.append("pipeline_id", pipeline);
    form.append("params", JSON.stringify(params), { contentType: "application/json" });

    const response = await axios.post(`${this.URL}key/api/v1/pipeline/run`, form, {
      headers: {
        ...this.AUTH_HEADERS,
        ...form.getHeaders(),
      },
    });

    return response.data.uuid;
  }

  async checkGeneration(requestId, attempts = 10, delay = 10) {
    while (attempts-- > 0) {
      const response = await axios.get(`${this.URL}key/api/v1/pipeline/status/${requestId}`, {
        headers: this.AUTH_HEADERS,
      });

      if (response.data.status === "DONE") {
        return response.data.result.files;
      }

      await new Promise((resolve) => setTimeout(resolve, delay * 1000));
    }
    throw new Error("Exhausted all attempts");
  }
}

async function chatRequestImageFusionBrain(content) {
  const api = new Text2ImageAPI(
    "https://api-key.fusionbrain.ai/",
    "5721DC9F44A7EBC5A64006D7E3C576F8",
    "543BC4A9EE330EF68AB1E7ECB7853EF6"
  );

  const pipelineId = await api.getPipeline();
  const uuid = await api.generate(content, pipelineId);
  const files = (await api.checkGeneration(uuid))[0];
  const buffer = Buffer.from(files, "base64");

  return buffer;
}

export { chatRequestImageFusionBrain };
