const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

/**
 * Download the video from the URL with retry logic and resume functionality
 * @param {string} url - URL of the video
 * @param {string} outputDir - output directory
 * @param {string} fileName - name of the file
 * @param {string} container_extension - container extension of the video
 * @param {number} [maxRetries=3] - maximum number of retries
 * @returns {Promise<string>} - path to the downloaded video
 */
async function downloadVideo(url, outputDir, fileName, container_extension, maxRetries = 3) {
    const filePath = path.join(outputDir, `${fileName}.${container_extension}`);
    let attempt = 0;
    let fileSize = 0;

    // Check if the file already exists and get its size
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        fileSize = stats.size;
    }

    while (attempt < maxRetries) {
        try {
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'stream',
                maxRedirects: 5,
                headers: {
                    Range: `bytes=${fileSize}-`,
                },
            });

            await new Promise((resolve, reject) => {
                const writer = fs.createWriteStream(filePath, { flags: 'a' });
                response.data.pipe(writer);

                // get the video size
                const totalSize = response.headers['content-length'] / 1024 / 1024;
                const roundedSize = Math.round(totalSize);
                console.log('Downloading video:', fileName, 'size:', roundedSize, 'MB');

                // progress bar
                let progress = fileSize;
                if (!process.env.DOCKER) {
                    response.data.on('data', (chunk) => {
                        progress += chunk.length;
                        process.stdout.write(`\r${Math.round(progress / 1024)}Kb downloaded`);
                    });
                }

                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            return filePath; // Download successful, return the file path
        } catch (error) {
            attempt++;
            console.error(`Attempt ${attempt} failed: ${error.message}`);
            if (attempt >= maxRetries) {
                throw new Error(`Failed to download video after ${maxRetries} attempts`);
            }
            console.log(`Retrying download (${attempt}/${maxRetries})...`);

            // Update fileSize in case of partial download
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                fileSize = stats.size;
            }
        }
    }
}

module.exports = { downloadVideo };
