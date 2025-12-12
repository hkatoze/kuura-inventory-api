// src/models/UniteFonctionnelle.js
module.exports = (sequelize, DataTypes) => {
  const UniteFonctionnelle = sequelize.define(
    "UniteFonctionnelle",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      serviceId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      timestamps: true,
      tableName: "unites_fonctionnelles",
    }
  );

  UniteFonctionnelle.associate = (models) => {
    UniteFonctionnelle.belongsTo(models.Service, {
      foreignKey: "serviceId",
      as: "service",
    });
    UniteFonctionnelle.hasMany(models.Local, {
      foreignKey: "uniteFonctionnelleId",
      as: "locals",
    });
    UniteFonctionnelle.hasMany(models.Materiel, {
      foreignKey: "uniteFonctionnelleId",
      as: "materiels",
    });
  };

  return UniteFonctionnelle;
};
