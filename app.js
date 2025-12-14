const bodyParser = require("body-parser");
const express = require("express");
const { initDb } = require("./src/db/sequelize");
const favicon = require("serve-favicon");
const cors = require("cors");
const path = require("path");

const cron = require("node-cron");

const app = express();
const port = process.env.PORT || 3000;
app
  .use(bodyParser.json())
  .use(cors())
  .use(favicon(__dirname + "/favicon.ico"));

app.use((req, res, next) => {
  console.log(`Requête reçue: ${req.method} ${req.url}`);
  next();
});
initDb();

/* ........All routes list........... */
require("./src/routes/adminEndpoints")(app);
require("./src/routes/localEndpoints")(app);
require("./src/routes/materielEndpoints")(app);
require("./src/routes/serviceEndpoints")(app);
require("./src/routes/ufEndpoints")(app);
require("./src/routes/materielCategorieEndpoints")(app);
require("./src/routes/materielEnergieEndpoints")(app);
require("./src/routes/materielMarqueEndpoints")(app);
require("./src/routes/materielMetaEndpoints")(app);
require("./src/routes/dashboardEndpoints")(app);


//404 error managment
app.use(({ res }) => {
  const message = `Impossible de trouver la ressource demandée! Vous pouvez essayer une autre URL.`;

  res?.status(404).json({ message });
});
app.use(
  "/downloads",
  express.static(path.join(__dirname, "public", "downloads"))
);
app.listen(port, "0.0.0.0", () => {
  console.log(`API démarée sur : http://localhost:${port}`);
});

module.exports = app;
