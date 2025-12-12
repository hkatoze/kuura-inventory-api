const path = require("path");
const fs = require("fs");
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

// Configure Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    dialectOptions:
      process.env.DB_SSL && process.env.DB_SSL.toLowerCase() === "true"
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
    define: {
      underscored: true,
      freezeTableName: false,
      timestamps: true,
    },
  }
);

// loader models
const models = {};
const modelsDir = path.join(__dirname, "models");

fs.readdirSync(modelsDir)
  .filter((file) => file.indexOf(".") !== 0 && file.slice(-3) === ".js")
  .forEach((file) => {
    const modelPath = path.join(modelsDir, file);
    const modelImporter = require(modelPath);
    const model = modelImporter(sequelize, DataTypes);
    models[model.name] = model;
  });

// associations
Object.keys(models).forEach((modelName) => {
  if (typeof models[modelName].associate === "function") {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

/**
 * initDb
 */
const initDb = async (opts = {}) => {
  const defaultOpts = { sync: true, alter: false, force: false };
  const { sync, alter, force } = Object.assign(defaultOpts, opts);

  try {
    await sequelize.authenticate();
    console.log("✅ Database connection OK");

    if (sync) {
      console.log("🔁 Synchronizing models with database...");
      await sequelize.sync({ alter, force });
      console.log("✅ Models synchronized");

    } else {
      console.log("ℹ️ sync skipped (use migrations in production)");
    }
     
  } catch (err) {
    console.error("❌ Unable to initialize DB:", err);
    throw err;
  }
};

module.exports = {
  initDb,
  sequelize,
  models,
};
