const db = require("../db/sequelize");
const { MaterielCategorie, Materiel } = db.models;
const { ValidationError } = require("sequelize");
const auth = require("../auth/auth");

module.exports = (app) => {
  /**
   * CREATE
   */
  app.post("/api/v1/materiel-categories", auth, async (req, res) => {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Le champ title est requis.",
      });
    }

    try {
      const categorie = await MaterielCategorie.create({ title });

      res.status(201).json({
        success: true,
        message: "Catégorie créée.",
        data: categorie,
      });
    } catch (error) {
      console.error("POST /materiel-categories", error);

      const status = error instanceof ValidationError ? 400 : 500;

      res.status(status).json({
        success: false,
        message:
          status === 400
            ? error.errors?.[0]?.message || error.message
            : "Erreur serveur.",
      });
    }
  });

  /**
   * READ ALL
   */
  app.get("/api/v1/materiel-categories", async (req, res) => {
    try {
      

      const categories = await MaterielCategorie.findAll({
       
        order: [["title", "ASC"]],
      });

      res.status(200).json({
        success: true,
        message: "Catégories reccupérés .",
        data: categories,
      });
    } catch (error) {
      console.error("GET /materiel-categories", error);

      res.status(500).json({
        success: false,
        message: "Erreur serveur.",
        data: error.message,
      });
    }
  });

  /**
   * READ ONE
   */
  app.get("/api/v1/materiel-categories/:id", async (req, res) => {
    try {
      const categorie = await MaterielCategorie.findByPk(req.params.id, {
        
      });

      if (!categorie) {
        return res.status(404).json({
          success: false,
          message: "Catégorie non trouvée.",
        });
      }

      res.status(200).json({
        success: true,
        message: "Catégorie .",
        data: categorie,
      });
    } catch (error) {
      console.error("GET /materiel-categories/:id", error);

      res.status(500).json({
        success: false,
        message: "Erreur serveur.",
        data: error.message,
      });
    }
  });

  /**
   * UPDATE
   */
  app.put("/api/v1/materiel-categories/:id", auth, async (req, res) => {
    try {
      const categorie = await MaterielCategorie.findByPk(req.params.id);

      if (!categorie) {
        return res.status(404).json({
          success: false,
          message: "Catégorie non trouvée.",
        });
      }

      const { title } = req.body;
      if (!title) {
        return res.status(400).json({
          success: false,
          message: "Le champ title est requis.",
        });
      }

      await categorie.update({ title });

      res.status(200).json({
        success: true,
        message: "Catégorie mise à jour.",
        data: categorie,
      });
    } catch (error) {
      console.error("PUT /materiel-categories/:id", error);

      const status = error instanceof ValidationError ? 400 : 500;

      res.status(status).json({
        success: false,
        message:
          status === 400
            ? error.errors?.[0]?.message || error.message
            : "Erreur serveur.",
      });
    }
  });

  /**
   * DELETE
   */
  app.delete("/api/v1/materiel-categories/:id", auth, async (req, res) => {
    try {
      const categorie = await MaterielCategorie.findByPk(req.params.id);

      if (!categorie) {
        return res.status(404).json({
          success: false,
          message: "Catégorie non trouvée.",
        });
      }

      const materielsCount = await Materiel.count({
        where: { categorieId: categorie.id },
      });

      if (materielsCount > 0) {
        return res.status(409).json({
          success: false,
          message:
            "Impossible de supprimer une catégorie contenant des matériels.",
        });
      }

      await categorie.destroy();

      res.status(200).json({
        success: true,
        message: "Catégorie supprimée.",
      });
    } catch (error) {
      console.error("DELETE /materiel-categories/:id", error);

      res.status(500).json({
        success: false,
        message: "Erreur serveur.",
        data: error.message,
      });
    }
  });
};
