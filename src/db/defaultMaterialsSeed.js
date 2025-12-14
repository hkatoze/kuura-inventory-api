module.exports = async function seedMaterielDefaults(models) {
  const { MaterielCategorie, MaterielMarque, MaterielEnergie } = models;

  if (!MaterielCategorie || !MaterielMarque || !MaterielEnergie) {
    throw new Error("❌ Modèles matériels non chargés avant le seed");
  }

  console.log("🌱 Seeding matériels par défaut...");

  const seedIfNotExists = async (Model, values) => {
    for (const title of values) {
      await Model.findOrCreate({
        where: { title },
        defaults: { title },
      });
    }
  };

  await seedIfNotExists(MaterielCategorie, [
    "----------",
    "Informatique",
    "Médical",
    "Mobilier",
    "Électrique",
    "Électronique",
    "Bureautique",
    "Climatisation",
    "Autres",
  ]);

  await seedIfNotExists(MaterielMarque, [
    "----------",
    "Dell",
    "HP",
    "Lenovo",
    "Asus",
    "Acer",
    "Philips",
    "Siemens",
    "Samsung",
    "LG",
    "Canon",
    "Epson",
    "Autre",
  ]);

  await seedIfNotExists(MaterielEnergie, [
    "----------",
    "Électricité",
    "Batterie",
    "Solaire",
    "Manuel",
    "Carburant",
    "Gaz",
    "Autre"
  ]);

  console.log("✅ Seeds matériels OK");
};
