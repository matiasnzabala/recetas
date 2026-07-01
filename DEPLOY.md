# 🚀 Deploy a Vercel — pasos exactos

El proyecto ya está **en GitHub** y **compila** (`npm run build` ✔). Para
publicarlo en Vercel solo faltan dos cosas que requieren tu cuenta:

1. **Autenticación de Vercel** (una vez).
2. **Una base PostgreSQL** para producción — SQLite **no** funciona en Vercel
   porque el filesystem es de solo lectura y efímero.

---

## 1. Base de datos PostgreSQL (prod)

Usá cualquiera (todas tienen free tier):

- **Vercel Postgres** (más simple, integrado): en el dashboard del proyecto →
  _Storage → Create Database → Postgres_. Te da la `DATABASE_URL`.
- **Neon** (https://neon.tech) o **Supabase** (https://supabase.com).

Cambiá el provider de Prisma a Postgres en `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"   // antes: "sqlite"
  url      = env("DATABASE_URL")
}
```

> Tip: podés mantener SQLite en local y Postgres en prod usando dos ramas o
> simplemente cambiando esta línea antes de deployar.

---

## 2. Deploy con la CLI

La CLI ya está instalada (`vercel --version`). Desde `D:\recetas`:

```powershell
# 1) Login (una vez, abre el navegador)
vercel login

# 2) Vincular / crear el proyecto
vercel link        # o: vercel   (crea el proyecto la primera vez)

# 3) Cargar variables de entorno en Vercel
vercel env add DATABASE_URL production        # pegás la URL de Postgres
vercel env add AUTH_SECRET production          # openssl rand -base64 32
vercel env add NEXTAUTH_URL production         # https://<tu-proyecto>.vercel.app
vercel env add APP_USER_EMAIL production
vercel env add APP_USER_PASSWORD production
vercel env add APP_USER_NAME production
# opcional:
vercel env add OPENAI_API_KEY production

# 4) Deploy a producción
vercel --prod
```

---

## 3. Inicializar la base en prod (una sola vez)

Después del primer deploy, con la `DATABASE_URL` de prod en tu `.env` local:

```powershell
npx prisma db push        # crea las tablas en Postgres
npm run db:seed           # crea tu usuario + recetas de ejemplo
```

(o corré estos comandos desde un entorno con acceso a la base de prod).

---

## 4. Alternativa: deploy desde el dashboard

1. https://vercel.com/new → importá `matiasnzabala/recetas`.
2. Framework: **Next.js** (autodetectado).
3. Agregá las variables de entorno de arriba.
4. **Deploy**. Vercel corre `npm run build` (que ya incluye `prisma generate`).

Si el build falla, Vercel muestra el log; los errores de tipos ya están
resueltos, así que lo más probable sería una variable faltante.
