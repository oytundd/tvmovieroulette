const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const spinButton = document.getElementById('spinButton');
const movieResult = document.getElementById('movieResult');
const movieTitle = document.getElementById('movieTitle');
const moviePoster = document.getElementById('moviePoster');
const movieOverview = document.getElementById('movieOverview');
const movieScores = document.getElementById('movieScores');
const movieGenres = document.getElementById('movieGenres');
const imdbScoreInput = document.getElementById('imdbScore');
const imdbScoreThreshold = document.getElementById('scores');
const genreSelector = document.getElementById('genre');
// const typeChecker = document.querySelector('input[name="type"]:checked');

async function getRandomMovie(imdbThreshold, genreSelected, typeSelected) {
    try {
        // const response = await fetch(`/api/random-movie?imdbThreshold=${imdbThreshold}&rtThreshold=${rtThreshold}`);
		const response = await fetch(`/.netlify/functions/get_movie?imdbThreshold=${imdbThreshold}&genreSelected=${genreSelected}&typeSelected=${typeSelected}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching random movie:', error);
    }
}
function getCheckedOption() {
    const checkedOption = document.querySelector('input[name="type"]:checked');
    return checkedOption.value;
  }


function displayMovie(movie) {
    movieTitle.textContent = movie.title;
    moviePoster.src = movie.poster_path;
    moviePoster.alt = `${movie.title} Poster`;
    movieOverview.textContent = movie.overview;
    movieGenres.textContent = movie.genres;
    movieScores.textContent = `IMDb: ${movie.imdbRating}/10 | Rotten Tomatoes: ${movie.rtRating}% | Metacritic: ${movie.metacriticRating}/100`;
    movieResult.classList.remove('hidden');
}

spinButton.addEventListener('click', async () => {
    spinButton.disabled = true;
    spinButton.textContent = 'Spinning...';
    
    // const imdbThreshold = imdbScoreInput.value;
    const imdbThreshold = imdbScoreThreshold.value;
    const genreSelected = getSelectedGenre();
    const typeSelected = getCheckedOption();
    // const rtThreshold = rtScoreInput.value;
    
    const movie = await getRandomMovie(imdbThreshold,genreSelected,typeSelected);
    if (movie) {
        displayMovie(movie);
    } else {
        movieResult.textContent = 'Failed to fetch a movie. Please try again.';
        movieResult.classList.remove('hidden');
    }
    
    spinButton.disabled = false;
    spinButton.textContent = 'Spin the Roulette';
});

document.addEventListener('DOMContentLoaded', function() {
    const customSelect = document.querySelector('.custom-select');
    const selectSelected = customSelect.querySelector('.select-selected');
    const selectItems = customSelect.querySelector('.select-items');
    let selectedGenre = 'Any'; // Default selected genre

    selectSelected.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('select-arrow-active');
        selectItems.classList.toggle('select-hide');
    });

    const genres = selectItems.querySelectorAll('div');
    genres.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            selectSelected.textContent = this.textContent;
            selectedGenre = this.getAttribute('data-value');
            selectSelected.classList.remove('select-arrow-active');
            selectItems.classList.add('select-hide');
            console.log('Selected genre:', selectedGenre); // Log the selected genre
        });
    });

    document.addEventListener('click', function() {
        selectSelected.classList.remove('select-arrow-active');
        selectItems.classList.add('select-hide');
    });

    // Function to get the currently selected genre
    window.getSelectedGenre = function() {
        return selectedGenre;
    };

    // Example: Add event listener to the "Spin the Roulette" button

});