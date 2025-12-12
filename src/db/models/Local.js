// src/models/Local.js
module.exports = (sequelize, DataTypes) => {
  const Local = sequelize.define(
    "Local",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      serviceId: { type: DataTypes.INTEGER, allowNull: false },
      uniteFonctionnelleId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      timestamps: true,
      tableName: "locals",
    }
  );

  Local.associate = (models) => {
    Local.belongsTo(models.Service, { foreignKey: "serviceId", as: "service" });
    Local.belongsTo(models.UniteFonctionnelle, {
      foreignKey: "uniteFonctionnelleId",
      as: "uniteFonctionnelle",
    });
    Local.hasMany(models.Materiel, { foreignKey: "localId", as: "materiels" });
  };

  return Local;
};
