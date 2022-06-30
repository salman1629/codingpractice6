const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "covid19India.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

let convertingStatesObject = (state) => {
  return {
    stateId: state.state_id,
    stateName: state.state_name,
    population: state.population,
  };
};

app.get("/states/", async (request, response) => {
  const getStatesQuery = `SELECT * FROM state;`;

  const state = db.all(getStatesQuery);
  response.send(state);
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateBasedOnIdQuery = `
    SELECT 
    *
    FROM
    state
    WHERE 
    state_id = ${stateId};`;
  const state = db.all(getStateBasedOnIdQuery);
  response.send(convertingStatesObject(state));
});

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const postDistrictQuery = `
 INSERT INTO district (district_name,state_id,cases,cured,active,deaths)
 VALUES('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;
  await db.run(postDistrictQuery);
  response.send("District Added Successfully");
});
