module.exports = {
  apps: [
    {
      name: 'taskmaster-api',
      script: 'src/server.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster', // Enable cluster mode for load balancing
      autorestart: true,
      watch: false, // Set to true in development
      max_memory_restart: '1G',

      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },

      // Error handling
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Advanced features
      min_uptime: '10s', // Minimum uptime before considered online
      max_restarts: 10, // Maximum number of unstable restarts
      restart_delay: 4000, // Delay between restarts

      // Monitoring
      listen_timeout: 3000,
      kill_timeout: 5000,

      // Source map support
      source_map_support: true,

      // Graceful shutdown
      shutdown_with_message: true,
      wait_ready: false,

      // Environment-specific settings
      node_args: '--max-old-space-size=2048', // Increase heap size

      // Cron restart (optional - restart daily at 3 AM)
      cron_restart: '0 3 * * *',

      // Exponential backoff restart delay
      exp_backoff_restart_delay: 100
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: ['production-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/taskmaster.git',
      path: '/var/www/taskmaster',
      'post-deploy': 'cd backend && npm ci --only=production && pm2 reload ecosystem.config.js --env production',
      'pre-deploy-local': '',
      'post-setup': 'npm install'
    },

    staging: {
      user: 'deploy',
      host: ['staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:yourusername/taskmaster.git',
      path: '/var/www/taskmaster-staging',
      'post-deploy': 'cd backend && npm ci --only=production && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging',
        PORT: 5001
      }
    }
  }
};
