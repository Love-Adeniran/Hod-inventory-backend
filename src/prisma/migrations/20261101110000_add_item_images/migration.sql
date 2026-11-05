CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "imgName" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Image" ADD CONSTRAINT "Image_itemId_fkey"
    FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
