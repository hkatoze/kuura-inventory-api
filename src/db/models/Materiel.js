// src/models/Materiel.js
module.exports = (sequelize, DataTypes) => {
  const Materiel = sequelize.define(
    "Materiel",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "Le code matériel doit être unique.",
        },
      },
      code: { type: DataTypes.STRING, allowNull: true },
      designation: { type: DataTypes.STRING, allowNull: false },

      modele: { type: DataTypes.STRING, allowNull: true },
      numeroSerie: { type: DataTypes.STRING, allowNull: true },
      anneeAcquisition: { type: DataTypes.INTEGER, allowNull: true },
      anneeMiseEnService: { type: DataTypes.INTEGER, allowNull: true },
      etat: {
        type: DataTypes.ENUM(
          "fonctionnel",
          "non_fonctionnel",
          "a_declasser",
          "a_redeployer",
          "a_reparer",
          "ras"
        ),
        allowNull: false,
        defaultValue: "fonctionnel",
      },
      puissanceKw: { type: DataTypes.FLOAT, allowNull: true },
      financement: { type: DataTypes.STRING, allowNull: true },
      quantite: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      observations: { type: DataTypes.TEXT, allowNull: true },

      // foreign keys
      categorieId: { type: DataTypes.INTEGER, allowNull: false },
      marqueId: { type: DataTypes.INTEGER, allowNull: false },
      energieId: { type: DataTypes.INTEGER, allowNull: false },

      serviceId: { type: DataTypes.INTEGER, allowNull: false },
      uniteFonctionnelleId: { type: DataTypes.INTEGER, allowNull: false },
      localId: { type: DataTypes.INTEGER, allowNull: false },

      // Soft delete flag
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      tableName: "materiels",
      defaultScope: {
        where: { isDeleted: false },
      },
    }
  );

  Materiel.associate = (models) => {
    Materiel.belongsTo(models.MaterielCategorie, {
      foreignKey: "categorieId",
      as: "categorie",
    });
    Materiel.belongsTo(models.MaterielMarque, {
      foreignKey: "marqueId",
      as: "marque",
    });
    Materiel.belongsTo(models.MaterielEnergie, {
      foreignKey: "energieId",
      as: "energie",
    });

    Materiel.belongsTo(models.Service, {
      foreignKey: "serviceId",
      as: "service",
    });
    Materiel.belongsTo(models.UniteFonctionnelle, {
      foreignKey: "uniteFonctionnelleId",
      as: "uniteFonctionnelle",
    });
    Materiel.belongsTo(models.Local, { foreignKey: "localId", as: "local" });
  };

  return Materiel;
};
