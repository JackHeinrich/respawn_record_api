require("dotenv").config();
const express = require("express");
const app = express();
const routes = require("./routes");

const cookieParser = require("cookie-parser");

const cors = require("cors");

const corsOptions = require("./util/corsOptions");

const credentials = require("./util/credentials");

app.use(cookieParser());

app.use(credentials);

app.use(cors(corsOptions));

app.use("/api", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
