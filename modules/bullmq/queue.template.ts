import { Queue } from "bullmq";

const connection = {
  host: process.env.REDIS_URL?.replace("redis://", "").split(":")[0] || "localhost",
  port: parseInt(process.env.REDIS_URL?.split(":").pop() || "6379"),
};

export const defaultQueue = new Queue("default", { connection });

// Usage:
// await defaultQueue.add("example", { key: "value" });
// await defaultQueue.add("example", { key: "value" }, { delay: 5000 });
// await defaultQueue.add("example", { key: "value" }, { repeat: { every: 60000 } });
