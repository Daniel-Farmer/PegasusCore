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
      name: "bifrost-proxy",
      script: "bash",
      args: "-c 'socat TCP-LISTEN:8081,fork,reuseaddr TCP:127.0.0.1:8080'",
      autorestart: true,
      max_restarts: 5,
      restart_delay: 3000,
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
