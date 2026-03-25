module.exports = {
  apps: [
    {
      name: "next",
      script: "node_modules/.bin/next",
      args: "start",
      env: {
        PORT: 3000,
        NODE_ENV: "production",
      },
    },
    {
      name: "bifrost",
      script: "bash",
      args: "-c 'npx -y @maximhq/bifrost'",
      autorestart: true,
      max_restarts: 5,
      restart_delay: 5000,
    },
{
      name: "flowise",
      script: "bash",
      args: "-c 'PORT=3001 npx flowise start'",
      autorestart: true,
      max_restarts: 5,
      restart_delay: 5000,
    },
  ],
};
