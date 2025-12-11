-- CreateEnum if missing
DO $$ BEGIN
    CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create table payouts if missing
CREATE TABLE IF NOT EXISTS "payouts" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" UUID,
    "rejectedAt" TIMESTAMP(3),
    "rejectedBy" UUID,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
DO $$ BEGIN
    ALTER TABLE "payouts"
        ADD CONSTRAINT "payouts_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "payouts"
        ADD CONSTRAINT "payouts_approvedBy_fkey"
        FOREIGN KEY ("approvedBy") REFERENCES "users"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "payouts"
        ADD CONSTRAINT "payouts_rejectedBy_fkey"
        FOREIGN KEY ("rejectedBy") REFERENCES "users"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
