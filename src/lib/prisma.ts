import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildUrl() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url) return url;
  try {
    const u = new URL(url);
    // Neon: switch to the pooled endpoint if on the direct host
    // Direct:  ep-xxx.region.aws.neon.tech
    // Pooled:  ep-xxx-pooler.region.aws.neon.tech
    if (u.hostname.includes("neon.tech") && !u.hostname.includes("-pooler")) {
      u.hostname = u.hostname.replace(
        /^(ep-[^.]+)(\..+)$/,
        "$1-pooler$2"
      );
    }
    // Add connect_timeout so suspended databases wake up before timing out
    u.searchParams.set("connect_timeout", "15");
    u.searchParams.set("sslmode", "require");
    return u.toString();
  } catch {
    return url;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: { db: { url: buildUrl() } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
