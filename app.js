const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "covid19India.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`Database Error is ${error}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//Get States API
convertStateDBObjectAPI1 = (object) => {
  return {
    stateId: object.state_id,
    stateName: object.state_name,
    population: object.population,
  };
};
app.get("/states/", async (request, response) => {
  const getStatesQuery = `
    SELECT *
    FROM state;`;
  const getStatesResponse = await db.all(getStatesQuery);
  response.send(
    getStatesResponse.map((object) => convertStateDBObjectAPI1(object))
  );
});

//Get state API
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    SELECT *
    FROM state
    WHERE state_id=${stateId};`;
  const getStateResponse = await db.get(getStateQuery);
  response.send(convertStateDBObjectAPI1(getStateResponse));
});

//Create district API
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const createDistrictQuery = `
    INSERT INTO district(district_name,state_id,cases,cured,active,deaths)
    VALUES('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;
  const createDistrictResponse = await db.run(createDistrictQuery);
  response.send("District Successfully Added");
});

//get district API
convertStateDBObjectAPI4 = (object) => {
  return {
    districtId: object.district_id,
    districtName: object.district_name,
    stateId: object.state_id,
    cases: object.cases,
    cured: object.cured,
    active: object.active,
    deaths: object.deaths,
  };
};
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    SELECT * FROM district WHERE district_id=${districtId};`;
  const getDistrictResponse = await db.get(getDistrictQuery);
  response.send(convertStateDBObjectAPI4(getDistrictResponse));
});

//Delete district API
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
    DELETE FROM district WHERE district_id=${districtId};`;
  const deleteDistrictResponse = await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

//update districts API
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDistrictQuery = `
  UPDATE district SET district_name = '${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths} WHERE district_id = ${districtId};`;
  const updateDistrictResponse = await db.run(updateDistrictQuery);
  response.send("District Details Updated");
});

//GET stats API
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStatsQuery = `
    SELECT SUM(cases) AS totalCases, SUM(cured) AS totalCured,
    SUM(active) AS totalActive, SUM(deaths) AS totalDeaths FROM district 
    WHERE state_id=${stateId};`;
  const getStatsResponse = await db.get(getStatsQuery);
  response.send(getStatsResponse);
});

//Get statename details API
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `
    SELECT state_id FROM district WHERE district_id=${districtId};`;
  const getDistrictIdResponse = await db.get(getDistrictIdQuery);
  const getStateNameQuery = `SELECT state_name AS stateName FROM state WHERE 
  state_id = ${getDistrictIdResponse.state_id}`;
  const getStateNameResponse = await db.get(getStateNameQuery);
  response.send(getStateNameResponse);
});
module.exports = app;
