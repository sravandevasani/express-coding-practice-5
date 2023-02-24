const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;
const initialiseDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("The server started at http://localhost:3000");
    });
  } catch (e) {
    console.log(e);
  }
};
initialiseDBAndServer();

let returnMovieNameCamelCase = (eachObj) => {
  let { movie_name } = eachObj;
  return {
    movieName: movie_name,
  };
};

let convertSnakeToCamelCase = (eachObj) => {
  let { movie_id, director_id, movie_name, lead_actor } = eachObj;
  return {
    movieId: movie_id,
    directorId: director_id,
    movieName: movie_name,
    leadActor: lead_actor,
  };
};
let convertDirectorsToCamelCase = (eachObj) => {
  return {
    directorId: eachObj.director_id,
    directorName: eachObj.director_name,
  };
};

//GET API for movie table
app.get("/movies/", async (req, res) => {
  const getMoviesQuery = `
    SELECT * FROM movie;`;
  let moviesData = await db.all(getMoviesQuery);

  let camelCaseData = moviesData.map((eachObj) => {
    return returnMovieNameCamelCase(eachObj);
  });

  res.send(camelCaseData);
});

//POST API movies table

app.post("/movies/", async (req, res) => {
  const movieDetails = req.body;
  let { directorId, movieName, leadActor } = movieDetails;
  let postMovieQuery = `
    INSERT INTO movie 
        (director_id, movie_name, lead_actor)
    VALUES 
        (${directorId}, '${movieName}', '${leadActor}');`;
  let dbResponse = await db.run(postMovieQuery);
  res.send("Movie Successfully Added");
});

//get with resource params
app.get("/movies/:movieId/", async (req, res) => {
  let movieId = req.params.movieId;
  const getMovieQuery = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  const movieResponse = await db.get(getMovieQuery);
  res.send(convertSnakeToCamelCase(movieResponse));
});

//PUT API movie table
app.put("/movies/:movieId/", async (req, res) => {
  let { movieId } = req.params;
  let updateDetails = req.body;
  let { directorId, movieName, leadActor } = updateDetails;

  console.log(updateDetails);
  let updateDetailsQuery = `  
  UPDATE movie 
  SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
  WHERE 
    movie_id = ${movieId}
  `;
  let updateResponse = await db.run(updateDetailsQuery);
  //console.log("Movie Details Updated");
  res.send("Movie Details Updated");
});

//DELETE API
app.delete("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  let movieDeleteQuery = `
    DELETE FROM 
        movie
    WHERE 
        movie_id = ${movieId};
    `;
  let dbResponse = await db.run(movieDeleteQuery);
  console.log("Movie Removed");
  res.send("Movie Removed");
});

//GET API directors
app.get("/directors/", async (req, res) => {
  let getDirectorsQuery = `
    SELECT * FROM director;
    `;
  let directorsDetails = await db.all(getDirectorsQuery);
  let requiredResponse = directorsDetails.map((eachObj) => {
    return convertDirectorsToCamelCase(eachObj);
  });
  res.send(requiredResponse);
});

//GET API director's movies
app.get("/directors/:directorId/movies/", async (req, res) => {
  let { directorId } = req.params;
  let getDirectorsMoviesQuery = `
    SELECT * FROM movie
    WHERE 
        director_id = ${directorId};
    `;
  let dbResponse = await db.all(getDirectorsMoviesQuery);
  let requiredResponse = dbResponse.map((eachObj) => {
    return returnMovieNameCamelCase(eachObj);
  });

  res.send(requiredResponse);
});

module.exports = app;
