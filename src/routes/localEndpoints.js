// src/routes/localEndpoints.js
const db = require("../db/sequelize");
const { Local, Service, UniteFonctionnelle, Materiel } = db.models;
const { ValidationError } = require("sequelize");
const auth = require("../auth/auth");

module.exports = (app) => {
  app.post("/api/v1/locals", auth, async (req, res) => {
    const { name, description, serviceId, uniteFonctionnelleId } = req.body;
    if (!name || !serviceId || !uniteFonctionnelleId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "name, serviceId et uniteFonctionnelleId requis.",
        });
    }
    try {
      const service = await Service.findByPk(serviceId);
      if (!service)
        return res
          .status(404)
          .json({ success: false, message: "Service non trouvé." });

      const uf = await UniteFonctionnelle.findByPk(uniteFonctionnelleId);
      if (!uf)
        return res
          .status(404)
          .json({
            success: false,
            message: "Unité fonctionnelle non trouvée.",
          });

      const local = await Local.create({
        name,
        description,
        serviceId,
        uniteFonctionnelleId,
      });
      res
        .status(201)
        .json({ success: true, message: "Local créé.", data: local });
    } catch (error) {
      console.error("POST /locals", error);
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

  app.get("/api/v1/locals", async (req, res) => {
    try {
      const serviceId = req.query.serviceId;
      const where = {};
      if (serviceId) where.serviceId = serviceId;
      const locals = await Local.findAll({ where, order: [["name", "ASC"]] });
      res.status(200).json({ success: true, data: locals });
    } catch (error) {
      console.error("GET /locals", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Erreur serveur.",
          data: error.message,
        });
    }
  });

  app.get("/api/v1/locals/:id", async (req, res) => {
    try {
      const local = await Local.findByPk(req.params.id, {
        include: [
          { model: Materiel, as: "materiels" },
          { model: UniteFonctionnelle, as: "uniteFonctionnelle" },
          { model: Service, as: "service" },
        ],
      });
      if (!local)
        return res
          .status(404)
          .json({ success: false, message: "Local non trouvé." });
      res.status(200).json({ success: true, data: local });
    } catch (error) {
      console.error("GET /locals/:id", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Erreur serveur.",
          data: error.message,
        });
    }
  });

  app.put("/api/v1/locals/:id", auth, async (req, res) => {
    try {
      const local = await Local.findByPk(req.params.id);
      if (!local)
        return res
          .status(404)
          .json({ success: false, message: "Local non trouvé." });
      await local.update(req.body);
      res
        .status(200)
        .json({ success: true, message: "Local mis à jour.", data: local });
    } catch (error) {
      console.error("PUT /locals/:id", error);
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

  app.delete("/api/v1/locals/:id", auth, async (req, res) => {
    try {
      const local = await Local.findByPk(req.params.id);
      if (!local)
        return res
          .status(404)
          .json({ success: false, message: "Local non trouvé." });
      // Optionnel : vérifier s'il contient des matériels avant suppression
      const count = await Materiel.count({ where: { localId: local.id } });
      if (count > 0) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Impossible de supprimer : le local contient des matériels.",
          });
      }
      await local.destroy();
      res.status(200).json({ success: true, message: "Local supprimé." });
    } catch (error) {
      console.error("DELETE /locals/:id", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Erreur serveur.",
          data: error.message,
        });
    }
  });
};
