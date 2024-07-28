# Megaripper

## Description

A Node.js project to obtain JSON list of media, construct, save, and download media resources in ott client like style.

## Setup

1. Clone the repository:

    ```sh
    git clone https://github.com/mikicvi/megaripper
    cd megaripper
    ```

2. Install dependencies:

    ```sh
    yarn install
    ```

3. Create a `megaripper/.env` file for environment variables if needed. Example:
    ```env
    BASEURL=https://example.com
    USERNAME=myusername
    PASSWORD=mypassword
    REGEXFILTER=some-regex
    CATEGORY=1234
    ```
    If in the docker environment, add `DOCKER=true` to your env

## Usage

Run the project with:

```sh
yarn start
```

## Docker Instructions

### Build Docker Image

1. Build the Docker image:
    ```sh
    docker build -t megaripper .
    ```

### Run Docker Container

2. Run the Docker container:
    ```sh
    docker run --env-file .env -p 3000:3000 megaripper
    ```

### Example Commands

-   To build the Docker image:

    ```sh
    docker build -t megaripper .
    ```

-   To run the Docker container:
    ```sh
    docker run --env-file .env -p 3000:3000 megaripper
    ```

## Project Structure

```
.dockerignore
.env
.gitignore
data/
    .DS_Store
    videos/
        .DS_Store
Dockerfile
package.json
README.md
src/
    downloader.js
    index.js
    saver.js
    utils/
        utils.js
```
