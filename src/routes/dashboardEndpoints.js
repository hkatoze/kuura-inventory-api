const db = require("../db/sequelize");
const { Service, UniteFonctionnelle, Local } = db.models;

const auth = require("../auth/auth");

module.exports = (app) => {
  /**
   * =====================================================
   *  GET /api/v1/dashboard/counts
   * =====================================================
   *  - Statistiques globales (dashboard)
   */
  app.get("/api/v1/dashboard/counts", auth, async (req, res) => {
    try {
      const [servicesCount, ufCount, localsCount] = await Promise.all([
        Service.count(),
        UniteFonctionnelle.count(),
        Local.count(),
      ]);

      return res.status(200).json({
        success: true,
        message: "Statistiques globales récupérées avec succès.",
        data: {
          service: servicesCount,
          uf: ufCount,
          local: localsCount,
        },
      });
    } catch (error) {
      console.error("Erreur GET /dashboard/counts :", error);
      return res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération des statistiques.",
        data: error.message,
      });
    }
  });
};
