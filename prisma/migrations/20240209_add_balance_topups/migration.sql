-- Create enum if not exists
DO $$ BEGIN
    CREATE TYPE "TopupStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create table if not exists
CREATE TABLE IF NOT EXISTS "balance_topups" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "TopupStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" UUID,
    "rejectedAt" TIMESTAMP(3),
    "rejectedBy" UUID,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "balance_topups_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys safely
DO $$ BEGIN
    ALTER TABLE "balance_topups"
      ADD CONSTRAINT "balance_topups_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "balance_topups"
      ADD CONSTRAINT "balance_topups_approvedBy_fkey"
      FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "balance_topups"
      ADD CONSTRAINT "balance_topups_rejectedBy_fkey"
      FOREIGN KEY ("rejectedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
