import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8989",
  headers: {
    "Content-Type": "application/json",
  },
});

async function chatRequestTextG4F(content) {
  const result = await instance.post("/data", {
    messages: content,
  });
  return result.data;
}

export { chatRequestTextG4F };
