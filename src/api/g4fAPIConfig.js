import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8989",
  headers: {
    "Content-Type": "application/json",
  },
});

async function chatRequestTextG4F(content) {
  try {
    const result = await instance.post("/data", {
      messages: content,
    });

    return result.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

export { chatRequestTextG4F };
