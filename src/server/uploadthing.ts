import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerAuthSession } from "@/server/auth";
import * as z from "zod";

const f = createUploadthing({
  errorFormatter: (err) => {
    return {
      message: err.message,
      zodError: err.cause instanceof z.ZodError ? err.cause.flatten() : null,
      code: err.code || "UNKNOWN_ERROR",
    };
  },
});

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const session = await getServerAuthSession();
      if (!session) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // You can perform additional actions here if needed
      console.log("File uploaded by user:", metadata.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;