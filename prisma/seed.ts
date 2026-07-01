import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.APP_USER_EMAIL || "matiasnzabala@gmail.com";
  const password = process.env.APP_USER_PASSWORD || "Recetario2026!";
  const name = process.env.APP_USER_NAME || "Matias";

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { email, name, passwordHash },
  });

  console.log(`✔ Usuario: ${email}`);

  // Colecciones base
  const collectionNames: { name: string; emoji: string }[] = [
    { name: "Pastas", emoji: "🍝" },
    { name: "Carnes", emoji: "🥩" },
    { name: "Pollo", emoji: "🍗" },
    { name: "Postres", emoji: "🍰" },
    { name: "Air Fryer", emoji: "🌀" },
    { name: "Vegetariano", emoji: "🥗" },
    { name: "Favoritas", emoji: "⭐" },
  ];

  const collections: Record<string, string> = {};
  for (const c of collectionNames) {
    const col = await prisma.collection.upsert({
      where: { userId_name: { userId: user.id, name: c.name } },
      update: { emoji: c.emoji },
      create: { userId: user.id, name: c.name, emoji: c.emoji },
    });
    collections[c.name] = col.id;
  }
  console.log(`✔ ${collectionNames.length} colecciones`);

  // Evitar duplicar recetas si se corre el seed varias veces
  const existing = await prisma.recipe.count({ where: { userId: user.id } });
  if (existing > 0) {
    console.log(`ℹ Ya hay ${existing} recetas, salteo el seed de recetas.`);
    return;
  }

  const samples = [
    {
      title: "Ñoquis de papa caseros",
      author: "@pastafresca",
      imageUrl:
        "https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=800&q=80",
      mealType: "almuerzo",
      difficulty: "medium",
      totalMinutes: 60,
      servings: 4,
      status: "EXCELLENT" as const,
      rating: 5,
      isFavorite: true,
      timesCooked: 3,
      collection: ["Pastas", "Favoritas"],
      tags: ["pastas", "casero", "clásico"],
      ingredients: [
        { quantity: "1", unit: "kg", name: "papas" },
        { quantity: "300", unit: "g", name: "harina" },
        { quantity: "1", unit: "", name: "huevo" },
        { quantity: "1", unit: "pizca", name: "sal" },
      ],
      steps: [
        "Hervir las papas con piel hasta que estén tiernas.",
        "Pisar las papas y dejar entibiar.",
        "Agregar harina, huevo y sal. Formar la masa sin amasar de más.",
        "Armar los cilindros, cortar y marcar con tenedor.",
        "Hervir en agua con sal hasta que floten.",
      ],
    },
    {
      title: "Pollo crocante en Air Fryer",
      author: "@airfryer.recetas",
      imageUrl:
        "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800&q=80",
      mealType: "cena",
      difficulty: "easy",
      totalMinutes: 30,
      servings: 2,
      status: "COOKED" as const,
      rating: 4,
      timesCooked: 2,
      collection: ["Pollo", "Air Fryer"],
      tags: ["pollo", "airfryer", "rápido"],
      ingredients: [
        { quantity: "500", unit: "g", name: "muslos de pollo" },
        { quantity: "1", unit: "taza", name: "pan rallado" },
        { quantity: "2", unit: "", name: "huevos" },
        { quantity: "", unit: "", name: "pimentón y ajo en polvo" },
      ],
      steps: [
        "Condimentar el pollo y pasar por huevo y pan rallado.",
        "Rociar con aceite en spray.",
        "Cocinar en Air Fryer a 200°C por 18 minutos, dando vuelta a la mitad.",
      ],
    },
    {
      title: "Brownie húmedo de chocolate",
      author: "@dulcesmomentos",
      imageUrl:
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80",
      mealType: "postre",
      difficulty: "easy",
      totalMinutes: 45,
      servings: 8,
      status: "WANT_TO_COOK" as const,
      isFavorite: true,
      collection: ["Postres", "Favoritas"],
      tags: ["postre", "chocolate", "horno"],
      ingredients: [
        { quantity: "200", unit: "g", name: "chocolate semiamargo" },
        { quantity: "150", unit: "g", name: "manteca" },
        { quantity: "3", unit: "", name: "huevos" },
        { quantity: "200", unit: "g", name: "azúcar" },
        { quantity: "100", unit: "g", name: "harina" },
      ],
      steps: [
        "Derretir el chocolate con la manteca.",
        "Batir huevos con azúcar e integrar el chocolate.",
        "Agregar la harina tamizada.",
        "Hornear a 180°C por 25 minutos. El centro debe quedar húmedo.",
      ],
    },
    {
      title: "Bowl de verduras asadas",
      author: "@comidareal",
      imageUrl:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
      mealType: "almuerzo",
      difficulty: "easy",
      totalMinutes: 40,
      servings: 2,
      status: "WANT_TO_COOK" as const,
      collection: ["Vegetariano"],
      tags: ["vegetariano", "saludable", "bowl"],
      ingredients: [
        { quantity: "1", unit: "", name: "batata" },
        { quantity: "1", unit: "", name: "zucchini" },
        { quantity: "1", unit: "taza", name: "garbanzos" },
        { quantity: "2", unit: "cda", name: "aceite de oliva" },
      ],
      steps: [
        "Cortar las verduras en cubos.",
        "Condimentar y asar a 200°C por 30 minutos.",
        "Servir sobre base de quinoa o arroz.",
      ],
    },
    {
      title: "Milanesa napolitana al horno",
      author: "@cocinaargenta",
      imageUrl:
        "https://images.unsplash.com/photo-1619221882220-947b3d3c8861?w=800&q=80",
      mealType: "cena",
      difficulty: "medium",
      totalMinutes: 50,
      servings: 4,
      status: "COOKED" as const,
      rating: 5,
      timesCooked: 5,
      isFavorite: true,
      collection: ["Carnes", "Favoritas"],
      tags: ["carne", "clásico", "horno"],
      ingredients: [
        { quantity: "4", unit: "", name: "milanesas de carne" },
        { quantity: "200", unit: "g", name: "salsa de tomate" },
        { quantity: "200", unit: "g", name: "muzzarella" },
        { quantity: "4", unit: "fetas", name: "jamón" },
      ],
      steps: [
        "Cocinar las milanesas hasta dorar.",
        "Cubrir con salsa, jamón y muzzarella.",
        "Gratinar en el horno hasta fundir el queso.",
      ],
    },
  ];

  for (const s of samples) {
    const recipe = await prisma.recipe.create({
      data: {
        userId: user.id,
        title: s.title,
        author: s.author,
        imageUrl: s.imageUrl,
        sourceUrl: "https://www.instagram.com/",
        sourceType: "instagram",
        mealType: s.mealType,
        difficulty: s.difficulty,
        totalMinutes: s.totalMinutes,
        servings: s.servings,
        status: s.status,
        rating: s.rating ?? null,
        ratedAt: s.rating ? new Date() : null,
        isFavorite: s.isFavorite ?? false,
        timesCooked: s.timesCooked ?? 0,
        lastCookedAt: s.timesCooked ? new Date() : null,
        ingredients: {
          create: s.ingredients.map((i, idx) => ({
            name: i.name,
            quantity: i.quantity || null,
            unit: i.unit || null,
            position: idx,
          })),
        },
        steps: {
          create: s.steps.map((content, idx) => ({ content, position: idx })),
        },
      },
    });

    for (const tagName of s.tags) {
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName },
      });
      await prisma.tagsOnRecipes.create({
        data: { recipeId: recipe.id, tagId: tag.id },
      });
    }

    for (const colName of s.collection) {
      const colId = collections[colName];
      if (colId) {
        await prisma.recipesOnCollections.create({
          data: { recipeId: recipe.id, collectionId: colId },
        });
      }
    }
  }

  console.log(`✔ ${samples.length} recetas de ejemplo`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
