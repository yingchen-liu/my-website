# My Official Website 4.0

## Development
1. Run the database

  ```
  $ rethinkdb
  ```

2. Run the website

  ```
  $ cd home & gulp
  ```

  Then open http://localhost:3000 (it may take a while)

## Deployment
```
pm2 startOrRestart ecosystem.config.js --env production
```
