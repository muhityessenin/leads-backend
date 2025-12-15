-- Make city optional
ALTER TABLE "leads_public"
ALTER COLUMN "city" DROP NOT NULL;

-- Make fullName optional
ALTER TABLE "leads_private"
ALTER COLUMN "fullName" DROP NOT NULL;
