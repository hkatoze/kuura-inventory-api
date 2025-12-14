const db = require("../db/sequelize");
const { MaterielMarque } = db.models;
const { ValidationError } = require("sequelize");
const auth = require("../auth/auth");

module.exports = (app) => {
  /**
   * CREATE
   */
  app.post("/api/v1/materiel-marques", auth, async (req, res) => {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Le champ title est requis.",
      });
    }

    try {
      const marque = await MaterielMarque.create({ title });

      res.status(201).json({
        success: true,
        message: "Marque créée.",
        data: marque,
      });
    } catch (error) {
      console.error("POST /materiel-marques", error);

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
  app.get("/api/v1/materiel-marques", async (req, res) => {
    try {
      const marques = await MaterielMarque.findAll({
        order: [["title", "ASC"]],
      });

      res.status(200).json({
        success: true,
        data: marques,
      });
    } catch (error) {
      console.error("GET /materiel-marques", error);

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
  app.get("/api/v1/materiel-marques/:id", async (req, res) => {
    try {
      const marque = await MaterielMarque.findByPk(req.params.id);

      if (!marque) {
        return res.status(404).json({
          success: false,
          message: "Marque non trouvée.",
        });
      }

      res.status(200).json({
        success: true,
        data: marque,
      });
    } catch (error) {
      console.error("GET /materiel-marques/:id", error);

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
  app.put("/api/v1/materiel-marques/:id", auth, async (req, res) => {
    try {
      const marque = await MaterielMarque.findByPk(req.params.id);

      if (!marque) {
        return res.status(404).json({
          success: false,
          message: "Marque non trouvée.",
        });
      }

      const { title } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: "Le champ title est requis.",
        });
      }

      await marque.update({ title });

      res.status(200).json({
        success: true,
        message: "Marque mise à jour.",
        data: marque,
      });
    } catch (error) {
      console.error("PUT /materiel-marques/:id", error);

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
  app.delete("/api/v1/materiel-marques/:id", auth, async (req, res) => {
    try {
      const marque = await MaterielMarque.findByPk(req.params.id);

      if (!marque) {
        return res.status(404).json({
          success: false,
          message: "Marque non trouvée.",
        });
      }

      await marque.destroy();

      res.status(200).json({
        success: true,
        message: "Marque supprimée.",
      });
    } catch (error) {
      console.error("DELETE /materiel-marques/:id", error);

      res.status(500).json({
        success: false,
        message: "Erreur serveur.",
        data: error.message,
      });
    }
  });
};
