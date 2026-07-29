DROP INDEX IF EXISTS "categories_name_key";

CREATE UNIQUE INDEX "categories_name_lower_key"
ON "categories" (LOWER("name"));
