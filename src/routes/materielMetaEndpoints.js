const db = require("../db/sequelize");
const { MaterielCategorie, MaterielEnergie, MaterielMarque } = db.models;

module.exports = (app) => {
  app.get("/api/v1/materiels-meta", async (req, res) => {
    try {
      const [categories, energies, marques] = await Promise.all([
        MaterielCategorie.findAll({
          attributes: ["id", "title"],
          order: [["title", "ASC"]],
        }),
        MaterielEnergie.findAll({
          attributes: ["id", "title"],
          order: [["title", "ASC"]],
        }),
        MaterielMarque.findAll({
          attributes: ["id", "title"],
          order: [["title", "ASC"]],
        }),
      ]);

      res.status(200).json({
        success: true,
        message : "Meta reccupérés",
        data: {
          categories,
          energies,
          marques,
        },
      });
    } catch (error) {
      console.error("GET /materiels/meta", error);

      res.status(500).json({
        success: false,
        message: "Erreur serveur.",
        data: error.message,
      });
    }
  });
};
