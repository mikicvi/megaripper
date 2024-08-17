const fs = require('fs-extra');
const path = require('path');

async function saveVideo(filePath, outputDir) {
    const fileName = path.basename(filePath);
    const destPath = path.join(outputDir, fileName);
    await fs.move(filePath, destPath, { overwrite: true });
}

module.exports = { saveVideo };
