// src/models/MaterielMarque.js
module.exports = (sequelize, DataTypes) => {
  const MaterielMarque = sequelize.define(
    "MaterielMarque",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false, unique: true },
    },
    { timestamps: true, tableName: "materiel_marques" }
  );

  MaterielMarque.associate = (models) => {
    MaterielMarque.hasMany(models.Materiel, {
      foreignKey: "marqueId",
      as: "materiels",
    });
  };

  return MaterielMarque;
};
