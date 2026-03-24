import OpenAI from "openai";

export function createBifrostClient() {
  return new OpenAI({
    baseURL: process.env.BIFROST_BASE_URL || "http://localhost:8080/openai",
    apiKey: process.env.BIFROST_API_KEY || "bifrost-internal",
  });
}
