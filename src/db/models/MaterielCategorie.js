// src/models/MaterielCategorie.js
module.exports = (sequelize, DataTypes) => {
  const MaterielCategorie = sequelize.define(
    "MaterielCategorie",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false, unique: true },
    },
    { timestamps: true, tableName: "materiel_categories" }
  );

  

  return MaterielCategorie;
};
