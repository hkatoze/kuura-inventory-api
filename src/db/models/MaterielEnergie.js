// src/models/MaterielEnergie.js
module.exports = (sequelize, DataTypes) => {
  const MaterielEnergie = sequelize.define(
    "MaterielEnergie",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false, unique: true },
    },
    { timestamps: true, tableName: "materiel_energies" }
  );

  MaterielEnergie.associate = (models) => {
    MaterielEnergie.hasMany(models.Materiel, {
      foreignKey: "energieId",
      as: "materiels",
    });
  };

  return MaterielEnergie;
};
