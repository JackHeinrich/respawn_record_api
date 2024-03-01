require("dotenv").config();
const express = require("express");
const app = express();
const routes = require("./routes");

const cors = require("cors");

const corsOptions = require("./util/corsOptions");

app.use(cors(corsOptions));

app.use("/api", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
