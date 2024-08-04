const { default: axios } = require('axios');
const fs = require('fs');
const fse = require('fs-extra');
require('dotenv').config();

/**
 * Ensure the directory exists, if not create it
 * @param {*} dirPath 
 * @returns {Promise<void>}
 */
async function ensureDirExists(dirPath) {
    await fse.ensureDir(dirPath);
}

/**
 * Gets the list of movies based on the category 
 * Takes username, password and category from the environment variables
 * @param {number} category
 * @returns {Promise<Array>} - array of movie objects
 */
async function getCategory(category) {
    try {
        const response = await axios.get(`${process.env.BASEURL}/player_api.php?username=${process.env.USERNAME}&password=${process.env.PASSWORD}&action=get_vod_streams&category_id=${category}`);

        // Ensure response is an array
        if (Array.isArray(response.data)) {
            return response.data;
        } else if (Array.isArray(response)) {
            return response;
        } else {
            console.error('Response is not an array:', response);
            return [];
        }
    } catch (error) {
        console.error('Error fetching category:', error);
        return [];
    }
}

/**
 * Cleans up the name of the movie, remove the filter prefix and trim the whitespace, replace the whitespace with a dash
 * @param {Array} movies - array of movie objects
 * @param {string} filter - filter to be removed from the movie name
 */
function cleanUpNames(movies, filter) {
    const commonSymbols = ['&', ':', ';', ',', '_', '&amp;', '|', '!', '?', '(', ')', '[', ']', '{', '}', '<', '>', '*', '^', '$', '#', '@', '+', '=', '~', '`', '%', '"', '\'', '\\', '/', '.'];
    movies.forEach(movie => {
        // Remove the filter prefix
        movie.name = movie.name.replace(new RegExp(`^${filter}`, 'g'), '').trim();
        // Remove common symbols
        commonSymbols.forEach(symbol => {
            movie.name = movie.name.replace(new RegExp(`\\${symbol}`, 'g'), '');
        });
        // Replace whitespace with dashes
        movie.name = movie.name.replace(/\s+/g, '-');
        // No symbols at the start of the name
        movie.name = movie.name.replace(/^-+/, '');
    });
}

/**
 * Creates a file with list of movies and their download links
 * @param {Array} movies - array of movie objects
 * @param {string} filePath - path to the new file
 * @returns {Promise<void>}
 */
async function createDownloadList(movies, filePath) {
    // Make new file for download links and movie names to be saved in format (movie_name, download_link)
    const newFile = fs.createWriteStream(filePath);
    movies.forEach(movie => {
        newFile.write(`${movie.name}, ${movie.download_link}\n`);
    });
    newFile.end();
    console.log('Download list created:', filePath);
}

/** Create download links for the movies, based on the download URL and the movie objects
 * @param {string} downloadUrl - base URL for downloading the movies
 * @param {Array} movies - array of movie objects
 * @returns {Promise<void>}
 */
async function createDownloadLinks(downloadUrl, movies) {
    const downloadLinks = movies.map(movie => `${downloadUrl}${movie.stream_id}.${movie.container_extension}`);
    // Push the download links to the array of movies
    movies.forEach((movie, index) => {
        movie.download_link = downloadLinks[index];
    });
}


module.exports = { ensureDirExists, getCategory, cleanUpNames, createDownloadLinks, createDownloadList };