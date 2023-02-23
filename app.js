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

let convertSnakeToCamelCase = (eachObj) => {
  let { movie_id, director_id, movie_name, lead_actor } = eachObj;
  return {
    movieId: movie_id,
    directorId: director_id,
    movieName: movie_name,
    leadActor: lead_actor,
  };
};

//GET API for movie table
app.get("/movies/", async (req, res) => {
  const getMoviesQuery = `
    SELECT * FROM movie;`;
  let moviesData = await db.all(getMoviesQuery);

  let camelCaseData = moviesData.map((eachObj) => {
    return convertSnakeToCamelCase(eachObj);
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
  res.send("Movie Successfully Updated");
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
