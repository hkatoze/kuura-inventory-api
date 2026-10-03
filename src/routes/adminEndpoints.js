const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const db = require("../db/sequelize");
const { Admin } = db.models;

// Pas de route d'inscription publique : les comptes administrateurs sont créés
// côté serveur (script ou base de données), jamais via l'API ouverte.

module.exports = (app) => {
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
        // Jamais le hash du mot de passe dans la réponse
        data: {
          id: admin.id,
          emailAddress: admin.emailAddress,
          nameAndSurname: admin.nameAndSurname,
        },
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
