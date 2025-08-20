
-- This is a placeholder SQL migration generated for initial schema.
-- When using `prisma migrate`, real SQL will be created automatically.
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE,
  name TEXT,
  "createdAt" TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Product" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  "cutType" TEXT,
  price NUMERIC(10,2) NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Order" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id),
  status TEXT DEFAULT 'created',
  amount NUMERIC(10,2) NOT NULL,
  address JSONB,
  "createdAt" TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "OrderItem" (
  id TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL REFERENCES "Order"(id),
  "productId" TEXT NOT NULL REFERENCES "Product"(id),
  qty INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL
);
