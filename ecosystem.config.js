module.exports = {
  apps: [
    {
      name: "next",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        PORT: 3000,
        NODE_ENV: "production",
      },
    },
    {
      name: "bifrost",
      script: "npx",
      args: "-y @maximhq/bifrost",
      autorestart: true,
    },
    {
      name: "flowise",
      script: "npx",
      args: "flowise start",
      env: {
        PORT: 3001,
      },
      autorestart: true,
    },
  ],
};
