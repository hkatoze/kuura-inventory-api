// src/routes/materielEndpoints.js
const db = require("../db/sequelize");
const {
  Materiel,
  MaterielCategorie,
  MaterielMarque,
  MaterielEnergie,
  Service,
  UniteFonctionnelle,
  Local,
} = db.models;
const { ValidationError, Op } = require("sequelize");
const auth = require("../auth/auth");

// Simple helper to generate a code.
// NOTE: adapte ce générateur à ta nomenclature exacte.
// Il attend un param companyAbbrev dans body OR process.env.COMPANY_ABBREV (ex: "CLO")
function generateMaterielCode({
  companyAbbrev = process.env.COMPANY_ABBREV || "CLO",
  service,
  unite,
  designation,
  sequence = 1,
}) {
  // service code: first 2 letters uppercase (or custom)
  const svc = service?.name
    ? service.name.replace(/\s+/g, "").toUpperCase().slice(0, 2)
    : "SV";
  const uf = unite?.name
    ? unite.name.replace(/\s+/g, "").toUpperCase().slice(0, 4)
    : "UF";
  // designation initials
  const desInit = designation
    ? designation
        .split(/\s+/)
        .map((w) => w[0] || "")
        .join("")
        .slice(0, 3)
        .toUpperCase()
    : "MAT";
  const qtyPart = String(sequence).padLeft
    ? String(sequence).padStart(2, "0")
    : String(sequence).padStart(2, "0");
  return `${companyAbbrev}/${svc}/${uf}/${desInit}/${qtyPart}`;
}

module.exports = (app) => {
  /**
   * POST /materiels
   * Body expects:
   * - designation (required), quantite (opt), categorieId, marqueId, energieId,
   * - modele, numeroSerie, anneeAcquisition, anneeMiseEnService, puissanceKw, financement, observations
   * - serviceId, uniteFonctionnelleId, localId
   * - optionally companyAbbrev to generate code
   */
  app.post("/api/v1/materiels", auth, async (req, res) => {
    try {
      const {
        designation,
        quantite = 1,
        categorieId,
        marqueId,
        energieId,
        modele,
        numeroSerie,
        anneeAcquisition,
        anneeMiseEnService,
        puissanceKw,
        financement,
        observations,
        serviceId,
        uniteFonctionnelleId,
        localId,
        code,
      } = req.body;

      // required checks
      if (
        !designation ||
        !categorieId ||
        !marqueId ||
        !energieId ||
        !serviceId ||
        !uniteFonctionnelleId ||
        !localId
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Champs requis manquants." });
      }

      // verify relations exist
      const [categorie, marque, energie, service, unite, local] =
        await Promise.all([
          MaterielCategorie.findByPk(categorieId),
          MaterielMarque.findByPk(marqueId),
          MaterielEnergie.findByPk(energieId),
          Service.findByPk(serviceId),
          UniteFonctionnelle.findByPk(uniteFonctionnelleId),
          Local.findByPk(localId),
        ]);
      if (!categorie || !marque || !energie || !service || !unite || !local) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Une ou plusieurs références (categorie/marque/energie/service/uf/local) sont invalides.",
          });
      }

      // generate code if not provided
      let finalCode = code;
      if (!finalCode) {
        // compute sequence: count existing materials with same designation pattern in that local
        const similarCount = await Materiel.count({
          where: {
            designation,
            localId,
          },
          paranoid: false,
        });
        finalCode = generateMaterielCode({
          companyAbbrev:  "CLO",
          service,
          unite,
          designation,
          sequence: similarCount + 1,
        });
      }

      // create
      const newMat = await Materiel.create({
        code: finalCode,
        designation,
        quantite,
        categorieId,
        marqueId,
        energieId,
        modele,
        numeroSerie,
        anneeAcquisition,
        anneeMiseEnService,
        puissanceKw,
        financement,
        observations,
        serviceId,
        uniteFonctionnelleId,
        localId,
      });

      res
        .status(201)
        .json({ success: true, message: "Matériel créé.", data: newMat });
    } catch (error) {
      console.error("POST /materiels", error);
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

  /**
   * GET /materiels
   * Filters:
   * - localId, serviceId, categorieId, marqueId, energieId, search (designation/code)
   * - page, pageSize
   */
  app.get("/api/v1/materiels", async (req, res) => {
    try {
      const { localId, serviceId, categorieId, marqueId, energieId, search } =
        req.query;
 

      const where = { isDeleted: false };

      if (localId) where.localId = localId;
      if (serviceId) where.serviceId = serviceId;
      if (categorieId) where.categorieId = categorieId;
      if (marqueId) where.marqueId = marqueId;
      if (energieId) where.energieId = energieId;
      if (search) {
        where[Op.or] = [
          { designation: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } },
        ];
      }

      const { rows, count } = await Materiel.findAndCountAll({
        where,
        include: [
          { model: MaterielCategorie, as: "categorie" },
          { model: MaterielMarque, as: "marque" },
          { model: MaterielEnergie, as: "energie" },
          { model: Service, as: "service" },
          {
            model: UniteFonctionnelle,
            as: "uniteFonctionnelle",
            include: [{ model: Service, as: "service" }],
          },
          {
            model: Local,
            as: "local",
            include: [
              {
                model: Service,
                as: "service",
                attributes: ["id", "name", "description"],
              },

              {
                model: UniteFonctionnelle,
                as: "uniteFonctionnelle",
                include: [
                  {
                    model: Service,
                    as: "service",
                    attributes: ["id", "name", "description"],
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res
        .status(200)
        .json({
          success: true,
          message: "Matériels reccupérés.",
          data: rows,
       
        });
    } catch (error) {
      console.error("GET /materiels", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Erreur serveur.",
          data: error.message,
        });
    }
  });

  /**
   * GET /materiels/:id
   */
  app.get("/api/v1/materiels/:id", async (req, res) => {
    try {
      const mat = await Materiel.findByPk(req.params.id, {
        include: [
          { model: MaterielCategorie, as: "categorie" },
          { model: MaterielMarque, as: "marque" },
          { model: MaterielEnergie, as: "energie" },
          { model: Service, as: "service" },
          { model: UniteFonctionnelle, as: "uniteFonctionnelle" },
          { model: Local, as: "local" },
        ],
      });
      if (!mat || mat.isDeleted)
        return res
          .status(404)
          .json({ success: false, message: "Matériel non trouvé." });
      res.status(200).json({ success: true,message: "Matériel", data: mat });
    } catch (error) {
      console.error("GET /materiels/:id", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Erreur serveur.",
          data: error.message,
        });
    }
  });

  /**
   * PUT /materiels/:id
   */
  app.put("/api/v1/materiels/:id", auth, async (req, res) => {
    try {
      const mat = await Materiel.findByPk(req.params.id);
      if (!mat || mat.isDeleted)
        return res
          .status(404)
          .json({ success: false, message: "Matériel non trouvé." });

      // prevent changing code to an existing code
      if (req.body.code && req.body.code !== mat.code) {
        const exists = await Materiel.findOne({
          where: { code: req.body.code },
        });
        if (exists)
          return res
            .status(409)
            .json({ success: false, message: "Code déjà utilisé." });
      }

      await mat.update(req.body);
      res
        .status(200)
        .json({ success: true, message: "Matériel mis à jour.", data: mat });
    } catch (error) {
      console.error("PUT /materiels/:id", error);
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

  /**
   * DELETE /materiels/:id (soft delete)
   */
  app.delete("/api/v1/materiels/:id", auth, async (req, res) => {
    try {
      const mat = await Materiel.findByPk(req.params.id);
      if (!mat || mat.isDeleted)
        return res
          .status(404)
          .json({ success: false, message: "Matériel non trouvé." });
      await mat.update({ isDeleted: true });
      res
        .status(200)
        .json({
          success: true,
          message: "Matériel marqué comme supprimé (soft delete).",
        });
    } catch (error) {
      console.error("DELETE /materiels/:id", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Erreur serveur.",
          data: error.message,
        });
    }
  });

  /**
   * Optional: restore a soft deleted materiel
   */
  app.post("/api/v1/materiels/:id/restore", auth, async (req, res) => {
    try {
      const mat = await Materiel.findByPk(req.params.id, { paranoid: false });
      if (!mat)
        return res
          .status(404)
          .json({ success: false, message: "Matériel non trouvé." });
      await mat.update({ isDeleted: false });
      res
        .status(200)
        .json({ success: true, message: "Matériel restauré.", data: mat });
    } catch (error) {
      console.error("POST /materiels/:id/restore", error);
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
