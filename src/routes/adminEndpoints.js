const { ValidationError, UniqueConstraintError } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const db = require("../db/sequelize");
const { Admin } = db.models;

module.exports = (app) => {
  /**
   * =====================================================
   *  POST /api/v1/adminSignup
   * =====================================================
   *  - Crée un nouveau compte administrateur
   */
  app.post("/api/v1/adminSignup", async (req, res) => {
    const { emailAddress, nameAndSurname, password } = req.body;

    if (!emailAddress || !nameAndSurname || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Les champs 'emailAddress', 'nameAndSurname' et 'password' sont requis.",
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const admin = await Admin.create({
        emailAddress,
        nameAndSurname,
        password: hashedPassword,
      });

      return res.status(201).json({
        success: true,
        message: "Création de compte administrateur réussie.",
        data: admin,
      });
    } catch (error) {
      console.error("Erreur adminSignup :", error);

      if (
        error instanceof ValidationError ||
        error instanceof UniqueConstraintError
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "L'administrateur n'a pas pu être créé. Réessayer dans quelques instants.",
        data: error.message,
      });
    }
  });

  /**
   * =====================================================
   *  POST /api/v1/adminLogin
   * =====================================================
   *  - Connecte un administrateur
   */
  app.post("/api/v1/adminLogin", async (req, res) => {
    const { emailAddress, password } = req.body;

    if (!emailAddress || !password) {
      return res.status(400).json({
        success: false,
        message: "Les champs 'emailAddress' et 'password' sont requis.",
      });
    }

    try {
      const admin = await Admin.findOne({ where: { emailAddress } });

      if (!admin) {
        return res.status(404).json({
          success: false,
          message:
            "Ce compte administrateur n'existe pas. Créer un compte ou réessayer une autre adresse email.",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Le mot de passe est incorrect.",
        });
      }

      const token = jwt.sign({ userId: admin.id }, process.env.JWT_SECRET, {
        expiresIn: "365d",
      });

      // Mise à jour du fcmToken (ou token de session)
      await Admin.update({ fcmToken: token }, { where: { id: admin.id } });

      return res.status(200).json({
        success: true,
        message: "Connexion administrateur réussie.",
        data: admin,
        token,
      });
    } catch (error) {
      console.error("Erreur adminLogin :", error);
      return res.status(500).json({
        success: false,
        message:
          "L'administrateur n'a pas pu se connecter. Réessayer dans quelques instants.",
        data: error.message,
      });
    }
  });
};
