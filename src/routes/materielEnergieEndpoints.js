const db = require("../db/sequelize");
const { MaterielEnergie, Materiel } = db.models;
const { ValidationError } = require("sequelize");
const auth = require("../auth/auth");

module.exports = (app) => {
  /**
   * CREATE
   */
  app.post("/api/v1/materiel-energies", auth, async (req, res) => {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Le champ title est requis.",
      });
    }

    try {
      const energie = await MaterielEnergie.create({ title });

      res.status(201).json({
        success: true,
        message: "Type d’énergie créé.",
        data: energie,
      });
    } catch (error) {
      console.error("POST /materiel-energies", error);

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
  app.get("/api/v1/materiel-energies", async (req, res) => {
    try {
     

      const energies = await MaterielEnergie.findAll({
      
        order: [["title", "ASC"]],
      });

      res.status(200).json({
        success: true,
        data: energies,
      });
    } catch (error) {
      console.error("GET /materiel-energies", error);

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
  app.get("/api/v1/materiel-energies/:id", async (req, res) => {
    try {
      const energie = await MaterielEnergie.findByPk(req.params.id, {
       
      });

      if (!energie) {
        return res.status(404).json({
          success: false,
          message: "Type d’énergie non trouvé.",
        });
      }

      res.status(200).json({
        success: true,
        data: energie,
      });
    } catch (error) {
      console.error("GET /materiel-energies/:id", error);

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
  app.put("/api/v1/materiel-energies/:id", auth, async (req, res) => {
    try {
      const energie = await MaterielEnergie.findByPk(req.params.id);

      if (!energie) {
        return res.status(404).json({
          success: false,
          message: "Type d’énergie non trouvé.",
        });
      }

      const { title } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: "Le champ title est requis.",
        });
      }

      await energie.update({ title });

      res.status(200).json({
        success: true,
        message: "Type d’énergie mis à jour.",
        data: energie,
      });
    } catch (error) {
      console.error("PUT /materiel-energies/:id", error);

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
  app.delete("/api/v1/materiel-energies/:id", auth, async (req, res) => {
    try {
      const energie = await MaterielEnergie.findByPk(req.params.id);

      if (!energie) {
        return res.status(404).json({
          success: false,
          message: "Type d’énergie non trouvé.",
        });
      }

      const materielsCount = await Materiel.count({
        where: { energieId: energie.id },
      });

      if (materielsCount > 0) {
        return res.status(409).json({
          success: false,
          message:
            "Impossible de supprimer un type d’énergie utilisé par des matériels.",
        });
      }

      await energie.destroy();

      res.status(200).json({
        success: true,
        message: "Type d’énergie supprimé.",
      });
    } catch (error) {
      console.error("DELETE /materiel-energies/:id", error);

      res.status(500).json({
        success: false,
        message: "Erreur serveur.",
        data: error.message,
      });
    }
  });
};
