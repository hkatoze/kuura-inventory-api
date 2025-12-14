// src/routes/serviceEndpoints.js
const db = require("../db/sequelize");
const { Service } = db.models;
const { ValidationError } = require("sequelize");
const auth = require("../auth/auth"); // ton middleware auth

module.exports = (app) => {
  // Create
  app.post("/api/v1/services", auth, async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Le nom du service est requis." });
    }
    try {
      const service = await Service.create({ name, description });
      res
        .status(201)
        .json({ success: true, message: "Service créé.", data: service });
    } catch (error) {
      console.error("POST /services error:", error);
      const status = error instanceof ValidationError ? 400 : 500;
      res
        .status(status)
        .json({
          success: false,
          message: status === 400 ? error.message : "Erreur serveur.",
          data: error.message,
        });
    }
  });

  // List with optional pagination
  app.get("/api/v1/services", async (req, res) => {
    try {
      const page = parseInt(req.query.page || "1");
      const pageSize = parseInt(req.query.pageSize || "100");
      const services = await Service.findAll({
     order: [["createdAt", "DESC"]],

        offset: (page - 1) * pageSize,
        limit: pageSize,
      });
      res
        .status(200)
        .json({ success: true, message: "Liste services.", data: services });
    } catch (error) {
      console.error("GET /services error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Erreur serveur.",
          data: error.message,
        });
    }
  });

  // Get single
  app.get("/api/v1/services/:id", async (req, res) => {
    try {
      const service = await Service.findByPk(req.params.id);
      if (!service)
        return res
          .status(404)
          .json({ success: false, message: "Service non trouvé." });
      res.status(200).json({ success: true, data: service });
    } catch (error) {
      console.error("GET /services/:id", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Erreur serveur.",
          data: error.message,
        });
    }
  });

  // Update
  app.put("/api/v1/services/:id", auth, async (req, res) => {
    try {
      const service = await Service.findByPk(req.params.id);
      if (!service)
        return res
          .status(404)
          .json({ success: false, message: "Service non trouvée." });
      await service.update(req.body);
      res
        .status(200)
        .json({ success: true, message: "Service mis à jour.", data: service });
    } catch (error) {
      console.error("PUT /services/:id", error);
      const status = error instanceof ValidationError ? 400 : 500;
      res
        .status(status)
        .json({
          success: false,
          message: status === 400 ? error.message : "Erreur serveur.",
          data: error.message,
        });
    }
  });

  // Delete (hard delete)
  app.delete("/api/v1/services/:id", auth, async (req, res) => {
    try {
      const service = await Service.findByPk(req.params.id);
      if (!service)
        return res
          .status(404)
          .json({ success: false, message: "Service non trouvé." });
      await service.destroy();
      res.status(200).json({ success: true, message: "Service supprimé." });
    } catch (error) {
      console.error("DELETE /services/:id", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Erreur serveur.",
          data: error.message,
        });
    }
  });

  app.delete("/api/v1/services/delete-multiple", auth, async (req, res) => {
    try {
      const { ids } = req.body;
   

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Le tableau 'ids' est requis et ne peut pas être vide.",
        });
      }

      // Vérifier les services existants
      const existing = await Service.findAll({
        where: { id: ids },
      });

      const existingIds = existing.map((s) => s.id);
      const notFoundIds = ids.filter((id) => !existingIds.includes(id));

      // Supprimer seulement ce qui existe
      const deletedCount = await Service.destroy({
        where: { id: existingIds },
      });

      return res.status(200).json({
        success: true,
        message: `${deletedCount} service(s) supprimé(s) avec succès.`,
        details: {
          deletedIds: existingIds,
          ignoredIds: notFoundIds,
        },
      });
    } catch (error) {
      console.error("Erreur DELETE /services/delete-multiple :", error);
      return res.status(500).json({
        success: false,
        message:
          "Erreur serveur lors de la suppression multiple des services.",
        data: error.message,
      });
    }
  });
};
