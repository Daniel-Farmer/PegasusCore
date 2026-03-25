import { Worker } from "bullmq";

const connection = {
  host: process.env.REDIS_URL?.replace("redis://", "").split(":")[0] || "localhost",
  port: parseInt(process.env.REDIS_URL?.split(":").pop() || "6379"),
};

const worker = new Worker(
  "default",
  async (job) => {
    console.log(`Processing job ${job.id}: ${job.name}`);

    switch (job.name) {
      case "example":
        // Your job logic here
        console.log("Processing example job with data:", job.data);
        break;

      default:
        console.log(`Unknown job type: ${job.name}`);
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

export default worker;
