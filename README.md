# 🍳 Mi Recetario

> Tu biblioteca personal de recetas de Instagram. Privada, rápida y visual.

Aplicación web **privada de un solo usuario** para guardar, organizar y cocinar
recetas que encontrás en Instagram. No guarda solo el link: construye tu propia
biblioteca con ingredientes, pasos, notas, calificaciones, colecciones,
planificador semanal y lista de compras.

Inspiración visual: **Netflix · Notion · Apple · Pinterest**. Interfaz oscura,
minimalista, con animaciones y optimizada para **iPhone**.

![Dashboard](docs/screenshot-dashboard.png)
_(placeholder — reemplazar por captura real)_

---

## ✨ Funcionalidades

- **Importar desde Instagram**: pegás el link y la app extrae título, imagen,
  autor, descripción, video, ingredientes, pasos, tiempo y etiquetas
  (OpenGraph + IA). Lo que no se pueda obtener, se completa a mano. **Nunca se
  pierde la URL original.**
- **Dashboard tipo Netflix**: continuar cocinando, últimas, favoritas, lo más
  cocinado, pendientes, colecciones y accesos rápidos.
- **Buscador instantáneo**: por nombre, ingrediente, etiqueta, autor, tiempo,
  colección, estado o favorita.
- **Estados**: Quiero hacer · Ya hice · Excelente · No me gustó.
- **Colecciones** ilimitadas (Pastas, Postres, Air Fryer, Navidad…).
- **Notas personales**, **calificación** de 5 estrellas e **historial** de
  veces cocinada.
- **Planificador semanal** con arrastrar y soltar (drag & drop).
- **Lista de compras** consolidada automáticamente (sin ingredientes
  duplicados) a partir de varias recetas.
- **Capa de IA (OpenAI)** desacoplada del frontend: extraer ingredientes/pasos,
  resumen, tipo de comida, etiquetas, tiempo y dificultad. Preparada para un
  **chat** futuro.
- **Backup**: exportar / importar toda la base en JSON.
- **PWA**: instalable en la pantalla de inicio del iPhone.

---

## 🧱 Stack

| Capa       | Tecnología                                     |
| ---------- | ---------------------------------------------- |
| Framework  | Next.js 16 (App Router) + React 19             |
| Lenguaje   | TypeScript                                      |
| Estilos    | Tailwind CSS v4 + componentes estilo shadcn/ui |
| Animación  | Motion (Framer Motion)                          |
| ORM        | Prisma 6                                        |
| Base       | SQLite (dev) · PostgreSQL (prod-ready)          |
| Auth       | Auth.js / NextAuth v5 (credenciales, 1 usuario) |
| IA         | OpenAI (opcional, con fallback heurístico)     |
| Drag&Drop  | @dnd-kit                                         |
| Tests      | Vitest + Testing Library                         |

---

## 🚀 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
#   editá .env y generá un AUTH_SECRET:  openssl rand -base64 32

# 3. Crear la base de datos y el cliente Prisma
npm run db:push

# 4. Sembrar usuario + recetas de ejemplo
npm run db:seed

# 5. Levantar en desarrollo
npm run dev
```

Abrí http://localhost:3000 y entrá con las credenciales del `.env`
(`APP_USER_EMAIL` / `APP_USER_PASSWORD`).

---

## 🔐 Variables de entorno

| Variable            | Descripción                                               |
| ------------------- | --------------------------------------------------------- |
| `DATABASE_URL`      | Conexión a la base. SQLite en dev, PostgreSQL en prod.    |
| `AUTH_SECRET`       | Secreto de Auth.js (`openssl rand -base64 32`).           |
| `NEXTAUTH_URL`      | URL base de la app.                                       |
| `APP_USER_EMAIL`    | Email del único usuario (lo crea el seed).                |
| `APP_USER_PASSWORD` | Contraseña del usuario.                                   |
| `APP_USER_NAME`     | Nombre a mostrar.                                         |
| `OPENAI_API_KEY`    | _(opcional)_ Habilita la IA real. Sin ella, hay fallback. |
| `OPENAI_MODEL`      | Modelo de OpenAI (default `gpt-4o-mini`).                 |

---

## 📜 Scripts

| Comando             | Acción                               |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Servidor de desarrollo.              |
| `npm run build`     | Build de producción (genera Prisma). |
| `npm run start`     | Servir el build.                     |
| `npm run lint`      | ESLint.                              |
| `npm run format`    | Prettier.                            |
| `npm test`          | Tests con Vitest.                    |
| `npm run db:push`   | Sincroniza el schema con la base.    |
| `npm run db:seed`   | Crea usuario + datos de ejemplo.     |
| `npm run db:studio` | Prisma Studio (GUI de la base).      |

---

## 🏗️ Arquitectura

```
src/
├─ app/
│  ├─ (app)/                 # rutas protegidas (dashboard, recetas, etc.)
│  ├─ api/                   # API routes (recipes, collections, planner…)
│  └─ login/                 # login público
├─ components/
│  ├─ ui/                    # primitivos estilo shadcn (button, card, dialog…)
│  └─ *.tsx                  # componentes de dominio (recipe-card, planner…)
├─ services/                 # 🧠 lógica desacoplada
│  ├─ instagram.ts           #   scraping OpenGraph/oEmbed
│  ├─ ai.ts                  #   capa OpenAI + fallback heurístico
│  ├─ recipe-import.ts       #   orquestador de importación
│  └─ shopping.ts            #   consolidación de ingredientes
├─ lib/
│  ├─ data/                  # repositorios (acceso a Prisma)
│  ├─ prisma.ts              # cliente singleton
│  ├─ validators.ts          # esquemas Zod
│  └─ utils.ts               # helpers
├─ auth.ts / auth.config.ts  # Auth.js
└─ proxy.ts                  # protección de rutas (middleware Next 16)
```

**Principios**

- Las llamadas a IA y scraping viven en `services/`, nunca en el frontend.
- El acceso a datos está centralizado en `lib/data/` (repositorios).
- Validación de entrada con **Zod** en todas las API.
- Base **normalizada**: usuarios, recetas, ingredientes, pasos, notas,
  etiquetas, colecciones, favoritos, historial (cook logs), plan semanal y
  lista de compras.

### Migrar a PostgreSQL

1. En `prisma/schema.prisma` cambiá `provider = "postgresql"`.
2. Poné una `DATABASE_URL` de Postgres.
3. `npm run db:push` (o `prisma migrate deploy` en prod).

---

## 📱 Uso desde el iPhone

1. En Instagram, tocá **Compartir → Copiar enlace**.
2. Abrí **Mi Recetario** → **Agregar**.
3. Pegá el enlace y tocá **Analizar**.
4. Revisá/editá y **Guardá**.

Agregá la app a la pantalla de inicio (Safari → Compartir → _Agregar a inicio_)
para usarla como PWA a pantalla completa.

---

## ☁️ Deploy en Vercel

1. Importá el repo en Vercel.
2. Configurá las variables de entorno (usá una base **PostgreSQL** para prod,
   ej. Vercel Postgres / Neon / Supabase).
3. `Build Command`: `npm run build` — `Install Command`: `npm install`.
4. Después del primer deploy, ejecutá el seed una vez contra la base de prod.

---

## 🧪 Tests

```bash
npm test
```

Cubren la lógica pura crítica: consolidación de la lista de compras, parser
heurístico de recetas y utilidades (tiempos, semana, URLs de Instagram).

---

## 🔮 Mejoras futuras

- Chat de cocina con IA (arquitectura ya preparada en `services/ai.ts`).
- Reconocimiento de ingredientes desde foto.
- Escala de porciones automática (recalcular cantidades).
- Compartir recetas / export a PDF.
- Modo "cocina" con pantalla siempre encendida y pasos grandes.
- Notificaciones del planificador.
- Sincronización de la lista de compras en tiempo real.

---

Hecho con ❤️ para uso personal.
