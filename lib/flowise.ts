import { FlowiseClient } from "flowise-sdk";

export function createFlowiseClient() {
  return new FlowiseClient({
    baseUrl: process.env.FLOWISE_BASE_URL || "http://localhost:3001",
  });
}
