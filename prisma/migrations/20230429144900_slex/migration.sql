/*
  Warnings:

  - You are about to drop the column `isGoogleAccount` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'User',
    "password" TEXT,
    "name" TEXT,
    "verificationId" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("email", "id", "isEmailVerified", "name", "password", "verificationId") SELECT "email", "id", "isEmailVerified", "name", "password", "verificationId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
