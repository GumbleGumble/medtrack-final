-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "primaryEmail" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAccess" (
    "id" TEXT NOT NULL,
    "grantedById" TEXT NOT NULL,
    "grantedToId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MedicationGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "isAsNeeded" BOOLEAN NOT NULL DEFAULT false,
    "minTimeBetweenDoses" INTEGER,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoseRecord" (
    "id" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "skipped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DoseRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_primaryEmail_key" ON "User"("primaryEmail");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccess_grantedToId_groupId_key" ON "UserAccess"("grantedToId", "groupId");

-- AddForeignKey
ALTER TABLE "UserAccess" ADD CONSTRAINT "UserAccess_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAccess" ADD CONSTRAINT "UserAccess_grantedToId_fkey" FOREIGN KEY ("grantedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAccess" ADD CONSTRAINT "UserAccess_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MedicationGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationGroup" ADD CONSTRAINT "MedicationGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MedicationGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoseRecord" ADD CONSTRAINT "DoseRecord_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
