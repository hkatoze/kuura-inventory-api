// src/models/Service.js
module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define(
    "Service",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "Le nom du service existe déjà.",
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: "services",
    }
  );

  Service.associate = (models) => {
    Service.hasMany(models.UniteFonctionnelle, {
      foreignKey: "serviceId",
      as: "ufs",
    });
    Service.hasMany(models.Local, { foreignKey: "serviceId", as: "locals" });
    Service.hasMany(models.Materiel, {
      foreignKey: "serviceId",
      as: "materiels",
    });
  };

  return Service;
};
