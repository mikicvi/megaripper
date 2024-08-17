const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { downloadVideo } = require('../src/downloader');

jest.mock('axios');
jest.mock('fs-extra');

describe('downloadVideo', () => {
    const url = 'http://example.com/video';
    const outputDir = '/path/to/output';
    const fileName = 'video';
    const container_extension = 'mp4';
    const maxRetries = 3;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should download the video successfully', async () => {
        const filePath = path.join(outputDir, `${fileName}.${container_extension}`);
        const response = {
            data: {
                pipe: jest.fn(),
                on: jest.fn(),
            },
            headers: {
                'content-length': 1024 * 1024 * 10, // 10MB
            },
        };
        const writer = {
            on: jest.fn(),
            finish: jest.fn(),
            error: jest.fn(),
        };

        axios.mockResolvedValue(response);
        fs.existsSync.mockReturnValue(false);
        fs.createWriteStream.mockReturnValue(writer);
        fs.statSync.mockReturnValue({ size: 0 });

        const result = await downloadVideo(url, outputDir, fileName, container_extension, maxRetries);

        expect(axios).toHaveBeenCalledWith({
            url,
            method: 'GET',
            responseType: 'stream',
            maxRedirects: 5,
            headers: {
                Range: 'bytes=0-',
            },
        });
        expect(fs.existsSync).toHaveBeenCalledWith(filePath);
        expect(fs.createWriteStream).toHaveBeenCalledWith(filePath, { flags: 'a' });
        expect(response.data.pipe).toHaveBeenCalledWith(writer);
        expect(response.data.on).toHaveBeenCalledWith('data', expect.any(Function));
        expect(writer.on).toHaveBeenCalledWith('finish', expect.any(Function));
        expect(writer.on).toHaveBeenCalledWith('error', expect.any(Function));
        expect(result).toBe(filePath);
    });

    it('should retry downloading the video when an error occurs', async () => {
        const filePath = path.join(outputDir, `${fileName}.${container_extension}`);
        const response = {
            data: {
                pipe: jest.fn(),
                on: jest.fn(),
            },
            headers: {
                'content-length': 1024 * 1024 * 10, // 10MB
            },
        };
        const writer = {
            on: jest.fn(),
            finish: jest.fn(),
            error: jest.fn(),
        };

        axios.mockRejectedValueOnce(new Error('Network error'));
        axios.mockResolvedValue(response);
        fs.existsSync.mockReturnValue(true);
        fs.statSync.mockReturnValue({ size: 1024 * 1024 }); // 1MB

        const result = await downloadVideo(url, outputDir, fileName, container_extension, maxRetries);

        expect(axios).toHaveBeenCalledTimes(2);
        expect(fs.existsSync).toHaveBeenCalledWith(filePath);
        expect(fs.createWriteStream).toHaveBeenCalledWith(filePath, { flags: 'a' });
        expect(response.data.pipe).toHaveBeenCalledWith(writer);
        expect(response.data.on).toHaveBeenCalledWith('data', expect.any(Function));
        expect(writer.on).toHaveBeenCalledWith('finish', expect.any(Function));
        expect(writer.on).toHaveBeenCalledWith('error', expect.any(Function));
        expect(result).toBe(filePath);
    });

    it('should throw an error when max retries exceeded', async () => {
        axios.mockRejectedValue(new Error('Network error'));
        fs.existsSync.mockReturnValue(false);

        await expect(downloadVideo(url, outputDir, fileName, container_extension, 2)).rejects.toThrowError(
            'Failed to download video after 2 attempts',
        );

        expect(axios).toHaveBeenCalledTimes(2);
        expect(fs.existsSync).not.toHaveBeenCalled();
        expect(fs.createWriteStream).not.toHaveBeenCalled();
    });

    it('should throw an error when file already exists', async () => {
        fs.existsSync.mockReturnValue(true);

        await expect(downloadVideo(url, outputDir, fileName, container_extension, maxRetries)).rejects.toThrowError(
            'Failed to download video after 3 attempts',
        );

        expect(axios).not.toHaveBeenCalled();
        expect(fs.existsSync).toHaveBeenCalledWith(path.join(outputDir, `${fileName}.${container_extension}`));
        expect(fs.createWriteStream).not.toHaveBeenCalled();
    });
});
