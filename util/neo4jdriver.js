// neo4jconnection.js

const neo4j = require("neo4j-driver");

const Password = process.env.NEO4J_PASSWORD;

const neo4jDriver = neo4j.driver(
  "neo4j://localhost:7687",
  neo4j.auth.basic("neo4j", Password)
);

module.exports = { neo4jDriver };
