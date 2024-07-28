require('dotenv').config();
const { downloadVideo } = require('./downloader');
const path = require('path');
const { getCategory, cleanUpNames, createDownloadList, createDownloadLinks, ensureDirExists } = require('./utils/utils');
const fs = require('fs');

async function main() {
    const dlUrl = `${process.env.BASEURL}/movie/${process.env.USERNAME}/${process.env.PASSWORD}/`;
    const outputDir = path.join(__dirname, '../data/videos');
    const downloadLinksPath = path.join(__dirname, '../data/download_links.txt');
    const regexFilter = process.env.REGEXFILTER;
    const category = process.env.CATEGORY;
    const moviesArr = await getCategory(category);
    ensureDirExists(outputDir);

    // construct the download URL's
    createDownloadLinks(dlUrl, moviesArr);
    // clean up the name of the movie, remove the EXYU| prefix and trim the whitespace, also replace the whitespace with a dash
    cleanUpNames(moviesArr, regexFilter);
    await createDownloadList(moviesArr, downloadLinksPath);


    // Download only one movie at a time
    for (const movie of moviesArr) {
        const filePath = path.join(outputDir, `${movie.name}.${movie.container_extension}`);
        // Skip if the file already exists, but check if the file size matches the expected size
        if (fs.existsSync(filePath)) {
            console.log(`Skipping ${movie.name}, already downloaded.`);
            continue;
        }
        const videoPath = await downloadVideo(movie.download_link, outputDir, movie.name, movie.container_extension);
        console.log(videoPath);
    }
}

main().catch(console.error);