var path = "/srv/www/mywebsite";

module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name      : "My Website",
      script    : "home/bin/www",
      watch: false,
      env: {
        COMMON_VARIABLE: "true"
      },
      env_production : {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user : "root",
      host : "165.227.216.98",
      ref  : "origin/master",
      repo : "https://github.com/ytxiuxiu/mysite-4.0.git",
      path : path,
      "post-deploy" : "npm --prefix " + path + "/current/home install " + path + "/current/home && " + 
                      "pm2 startOrRestart ecosystem.config.js --env production"
    }
  }
};
