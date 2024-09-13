-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "recipeLocation",
ADD COLUMN     "isComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "locationType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RecipeLocation" DROP COLUMN "image",
ADD COLUMN     "image1" TEXT,
ADD COLUMN     "image2" TEXT,
ADD COLUMN     "locationName" TEXT,
ADD COLUMN     "region" TEXT,
ALTER COLUMN "coordinates" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

