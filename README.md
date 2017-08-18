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
1. Build the project

  ```
  $ cd home
  $ docker build -t ytxiuxiu/mywebsite .
  $ cd ../nginx
  $ docker build -t ytxiuxiu/mywebsite-nginx .
  ```

2. Publish to docker

  ```
  $ docker push ytxiuxiu/mywebsite
  $ docker push ytxiuxiu/mywebsite-nginx
  ```

3. Run

  ```
  $ docker-compose run
  ```