// utils.test.js

const { cleanUpNames } = require('../src/utils/utils');

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
            { name: '  Movie Name  ' }
        ];
        cleanUpNames(movies, 'FilterPrefix');
        expect(movies[0].name).toBe('Movie-Name-With-Symbols');
        expect(movies[1].name).toBe('Another-Movie');
        expect(movies[2].name).toBe('Movie-Name');
    });
});