const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient(process.env.MONGODB_URI);

const clientPromise = mongoClient.connect();

const handler = async (event) => {
  const { imdbThreshold, genreSelected, typeSelected } = event.queryStringParameters;
    try {
      //get a random movie from mongodb narrowing results by score
        const database = (await clientPromise).db(process.env.MONGODB_DATABASE);
        const collection = database.collection(process.env.MONGODB_COLLECTION);
        let results = ''
        console.log(typeSelected)
        if(genreSelected === 'Any'){
          results = await collection.aggregate([
            { $match: { titleType: typeSelected,
                        averageRating: { $gt:parseFloat(imdbThreshold) },
                        numVotes: {$gt:25000} } 
                      },
            { $sample: { size: 1 } }
        ]).toArray()
      }else{
        console.log(typeof(genreSelected));
          results = await collection.aggregate([
          { $match: { titleType: typeSelected,
                      genres: {$regex: genreSelected },
                      averageRating: { $gt:parseFloat(imdbThreshold) },
                      numVotes: {$gt:25000} } 
                    },
          { $sample: { size: 1 } }
      ]).toArray()
      }

      const imdbId = results[0].tconst;
      console.log(results[0]);
      
      
      if(typeSelected === 'movie'){
      //get details of random movie
      const detailResponse = await fetch(`https://api.themoviedb.org/3/movie/${imdbId}?api_key=${process.env.TMDB_API_KEY}&append_to_response=external_ids,release_dates`);
      const detailData = await detailResponse.json();
      //console.log(detailData)

      const omdbResponse = await fetch(`http://www.omdbapi.com/?i=${imdbId}&apikey=${process.env.OMDB_API_KEY}`);
      const omdbData = await omdbResponse.json();

      const rtScore = omdbData.Ratings.find(rating => rating.Source === "Rotten Tomatoes")?.Value;
      const rtRating = rtScore ? parseInt(rtScore) : 0;

      const metacriticScore = omdbData.Ratings.find(rating => rating.Source === "Metacritic")?.Value;
      const metacriticRating = metacriticScore ? parseInt(metacriticScore) : 0;

      validMovie = {
        title: detailData.title,
        overview: detailData.overview,
        poster_path: 'https://image.tmdb.org/t/p/w500'+detailData.poster_path,
        imdbRating: results[0].averageRating,
        rtRating: rtRating,
        metacriticRating: metacriticRating,
        genres: results[0].genres
      };

    }else if(typeSelected === 'tvSeries'){
      try {
        const detailResponse = await fetch(`https://api.tvmaze.com/lookup/shows?imdb=${imdbId}`);
        const detailData = await detailResponse.json();
        console.log(detailData);
        const cleanedString = detailData.summary.replace(/<[^>]*>/g, "")
        // console.log(detailData);
        // const posterPathRaw = detailData.image.medium;
        // console.log(posterPathRaw);
        // const posterPath = posterPathRaw.slice(31,posterPathRaw.length);

        validMovie = {
          title: detailData.name,
          overview: cleanedString,
          poster_path: detailData.image.original,
          imdbRating: results[0].averageRating,
          genres: results[0].genres
        };

        console.log(validMovie);
      } catch (error) {
        console.log(error);
      }

    }
        return {
            statusCode: 200,
            body: JSON.stringify(validMovie),
        }
    } catch (error) {
        return { statusCode: 500, body: error.toString() }
    }
}

module.exports = { handler }