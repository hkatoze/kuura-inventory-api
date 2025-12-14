// src/routes/ufEndpoints.js
const db = require("../db/sequelize");
const { UniteFonctionnelle, Service } = db.models;
const { ValidationError } = require("sequelize");
const auth = require("../auth/auth");

module.exports = (app) => {
  app.post("/api/v1/ufs", auth, async (req, res) => {
    const { name, description, serviceId } = req.body;
    if (!name || !serviceId) {
      return res
        .status(400)
        .json({ success: false, message: "name et serviceId requis." });
    }
    try {
      // verify service exists
      const svc = await Service.findByPk(serviceId);
      if (!svc)
        return res
          .status(404)
          .json({ success: false, message: "Service non trouvé." });

      const uf = await UniteFonctionnelle.create({
        name,
        description,
        serviceId,
      });
      res
        .status(201)
        .json({ success: true, message: "Unité créée.", data: uf });
    } catch (error) {
      console.error("POST /ufs", error);
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

 app.get("/api/v1/ufs", async (req, res) => {
   try {
  
     const ufs = await UniteFonctionnelle.findAll({
       include: [
         {
           model: Service,
           as: "service",
           attributes: ["id", "name", "description"],
         },
       ],
       order: [["createdAt", "DESC"]],
     });

     res
       .status(200)
       .json({ success: true, message: "Liste des unités.", data: ufs });
   } catch (error) {
     console.error("GET /ufs", error);
     res.status(500).json({
       success: false,
       message: "Erreur serveur.",
       data: error.message,
     });
   }
 });


  app.get("/api/v1/ufs/:id", async (req, res) => {
    try {
      const uf = await UniteFonctionnelle.findByPk(req.params.id);
      if (!uf)
        return res
          .status(404)
          .json({ success: false, message: "Unité non trouvée." });
      res.status(200).json({ success: true, data: uf });
    } catch (error) {
      console.error("GET /ufs/:id", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Erreur serveur.",
          data: error.message,
        });
    }
  });

  app.put("/api/v1/ufs/:id", auth, async (req, res) => {
    try {
      const uf = await UniteFonctionnelle.findByPk(req.params.id);
      if (!uf)
        return res
          .status(404)
          .json({ success: false, message: "Unité non trouvée." });
      await uf.update(req.body);
      res
        .status(200)
        .json({ success: true, message: "Unité mise à jour.", data: uf });
    } catch (error) {
      console.error("PUT /ufs/:id", error);
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

  app.delete("/api/v1/ufs/:id", auth, async (req, res) => {
    try {
      const uf = await UniteFonctionnelle.findByPk(req.params.id);
      if (!uf)
        return res
          .status(404)
          .json({ success: false, message: "Unité non trouvée." });
      await uf.destroy();
      res.status(200).json({ success: true, message: "Unité supprimée." });
    } catch (error) {
      console.error("DELETE /ufs/:id", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Erreur serveur.",
          data: error.message,
        });
    }
  });


    app.delete("/api/v1/ufs/delete-multiple", auth, async (req, res) => {
      try {
        const { ids } = req.body;
     
  
        if (!Array.isArray(ids) || ids.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Le tableau 'ids' est requis et ne peut pas être vide.",
          });
        }
  
        // Vérifier les unites existants
        const existing = await UniteFonctionnelle.findAll({
          where: { id: ids },
        });
  
        const existingIds = existing.map((s) => s.id);
        const notFoundIds = ids.filter((id) => !existingIds.includes(id));
  
        // Supprimer seulement ce qui existe
        const deletedCount = await UniteFonctionnelle.destroy({
          where: { id: existingIds },
        });
  
        return res.status(200).json({
          success: true,
          message: `${deletedCount} unite(s) supprimé(s) avec succès.`,
          details: {
            deletedIds: existingIds,
            ignoredIds: notFoundIds,
          },
        });
      } catch (error) {
        console.error("Erreur DELETE /ufs/delete-multiple :", error);
        return res.status(500).json({
          success: false,
          message:
            "Erreur serveur lors de la suppression multiple des unites.",
          data: error.message,
        });
      }
    });
};
