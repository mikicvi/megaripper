const axios = require('axios');
const fse = require('fs-extra');
const fs = require('fs');
const {
    cleanUpNames,
    getCategory,
    ensureDirExists,
    createDownloadList,
    createDownloadLinks,
} = require('../src/utils/utils');

describe('utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('ensureDirExists', () => {
        const dirPath = 'testDir';
        jest.spyOn(fse, 'ensureDir');
        it('should ensure the directory exists', async () => {
            fse.ensureDir.mockResolvedValue();
            await ensureDirExists(dirPath);

            expect(fse.ensureDir).toHaveBeenCalledWith(dirPath);
            expect(fse.ensureDir).toHaveBeenCalledTimes(1);
        });
    });

    describe('cleanUpNames', () => {
        it('should remove common symbols and replace whitespace with dashes', () => {
            const movies = [{ name: 'Movie & Name: With; Symbols,' }];
            cleanUpNames(movies, '');

            expect(movies[0].name).toBe('Movie-Name-With-Symbols');
        });

        it('should remove the filter prefix from the movie name', () => {
            const movies = [{ name: 'FilterPrefix Movie Name' }];
            cleanUpNames(movies, 'FilterPrefix');

            expect(movies[0].name).toBe('Movie-Name');
        });

        it('should trim whitespace and replace it with dashes', () => {
            const movies = [{ name: '  Movie Name  ' }];
            cleanUpNames(movies, '');

            expect(movies[0].name).toBe('Movie-Name');
        });

        it('should handle multiple movies', () => {
            const movies = [
                { name: 'Movie & Name: With; Symbols,' },
                { name: 'FilterPrefix Another Movie' },
                { name: '  Movie Name  ' },
            ];
            cleanUpNames(movies, 'FilterPrefix');

            expect(movies[0].name).toBe('Movie-Name-With-Symbols');
            expect(movies[1].name).toBe('Another-Movie');
            expect(movies[2].name).toBe('Movie-Name');
        });
    });

    describe('getCategory', () => {
        const category = 1;
        jest.spyOn(axios, 'get');
        const consoleSpy = jest.spyOn(console, 'error');
        it('should get the category of movies from API - response is an array', async () => {
            axios.get.mockResolvedValue({
                data: [{ name: 'Content category' }],
            });
            const movies = await getCategory(category);

            expect(movies).toEqual([{ name: 'Content category' }]);
        });

        it('should get the category of movies from API - response is an array, but response is not in .data ', async () => {
            axios.get.mockResolvedValue([{ name: 'Content category' }]);
            const movies = await getCategory(category);

            expect(movies).toEqual([{ name: 'Content category' }]);
        });

        it('should get the category of movies from API - response is not an array', async () => {
            axios.get.mockResolvedValue({ name: 'Content category' });
            const movies = await getCategory(category);

            expect(movies).toEqual([]);
            expect(consoleSpy).toHaveBeenCalledWith('Response is not an array:', { name: 'Content category' });
        });

        it('should handle error while fetching the category', async () => {
            axios.get.mockRejectedValue('API not reachable');
            const movies = await getCategory(category);

            expect(movies).toEqual([]);
            expect(consoleSpy).toHaveBeenCalledWith('Error fetching category:', 'API not reachable');
        });
    });
    describe('createDownloadList', () => {
        it('should create a file with list of movies and their download links', async () => {
            const movies = [
                { name: 'Movie 1', stream_url: 'http://movie1.com' },
                { name: 'Movie 2', stream_url: 'http://movie2.com' },
            ];
            const writeMock = jest.fn();
            const createWriteStreamSpy = jest.spyOn(fs, 'createWriteStream');
            createWriteStreamSpy.mockReturnValue({
                write: writeMock,
                end: jest.fn(),
            });
            const consoleLogMock = jest.spyOn(console, 'log');
            await createDownloadList(movies, 'downloadList.txt');

            expect(createWriteStreamSpy).toHaveBeenCalledWith('downloadList.txt');
            expect(writeMock).toHaveBeenCalledTimes(2);
            expect(consoleLogMock).toHaveBeenCalledWith('Download list created:', 'downloadList.txt');
        });
    });

    describe('createDownloadLinks', () => {
        it('should create download links for the movies', async () => {
            const downloadUrl = 'http://example.com/download/';
            const movies = [
                { stream_id: 1, container_extension: 'mp4' },
                { stream_id: 2, container_extension: 'mkv' },
            ];
            const expectedDownloadLinks = ['http://example.com/download/1.mp4', 'http://example.com/download/2.mkv'];
            await createDownloadLinks(downloadUrl, movies);

            expect(movies[0].download_link).toBe(expectedDownloadLinks[0]);
            expect(movies[1].download_link).toBe(expectedDownloadLinks[1]);
        });
    });
});
