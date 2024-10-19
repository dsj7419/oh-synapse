import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  adminProcedure,
  editorProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { logServerAction } from "@/server/audit";

// Helper function to ensure authentication
const ensureAuth = (ctx: any) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return ctx.session.user;
};

// Helper function for logging actions
const logActionHelper = async (
  ctx: any,
  action: string,
  resourceType: string,
  resourceId: string,
  severity: string,
  details: any
) => {
  const user = ensureAuth(ctx);
  await logServerAction({
    userId: user.id,
    username: user.name ?? 'Unknown',
    userRole: user.roles.join(', '),
    action,
    resourceType,
    resourceId,
    severity,
    details,
  });
};

export const templateRouter = createTRPCRouter({
  // getAllTemplates
  getAllTemplates: protectedProcedure.query(async ({ ctx }) => {
    const templates = await ctx.db.template.findMany({
      include: {
        assignments: {
          include: {
            memetic: {
              include: {
                tier: true,
                tag: true,
              },
            },
          },
        },
      },
      orderBy: { order: 'asc' },
    });
    return templates;
  }),  

  createTemplate: editorProcedure
  .input(z.object({
    name: z.string(),
    description: z.string().optional(),
    memeticIds: z.array(z.string()),
    isPublished: z.boolean().default(false),
  }))
  .mutation(async ({ ctx, input }) => {
    try {
      const highestOrder = await ctx.db.template.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      const newOrder = (highestOrder?.order ?? 0) + 1;

      const newTemplate = await ctx.db.template.create({
        data: {
          name: input.name,
          description: input.description,
          isPublished: input.isPublished,
          order: newOrder,
          assignments: {
            create: input.memeticIds.map((memeticId, index) => ({
              memetic: { connect: { id: memeticId } },
              rank: index,
            })),
          },
        },
        include: {
          assignments: {
            include: {
              memetic: {
                include: {
                  tier: true,
                  tag: true,
                },
              },
            },
          },
        },
      });
      await logActionHelper(ctx, "Create Template", "Template", newTemplate.id, "normal", input);
      return newTemplate;
    } catch (error) {
      console.error("Error creating template:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create template",
      });
    }
  }),

  updateTemplate: editorProcedure
  .input(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    memeticIds: z.array(z.string()),
    isPublished: z.boolean(),
  }))
  .mutation(async ({ ctx, input }) => {
    try {
    const { id, memeticIds, ...updateData } = input;
    const updatedTemplate = await ctx.db.template.update({
        where: { id },
        data: {
        ...updateData,
        assignments: {
            deleteMany: {},
            create: memeticIds.map((memeticId, index) => ({
            memetic: { connect: { id: memeticId } },
            rank: index,
            })),
        },
        },
        include: {
        assignments: {
            include: {
            memetic: {
                include: {
                tier: true,
                tag: true,
                },
            },
            },
        },
        },
    });
    await logActionHelper(ctx, "Update Template", "Template", id, "normal", input);
    return updatedTemplate;
    } catch (error) {
    console.error("Error updating template:", error);
    throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update template",
      });
    }
  }),

  updateTemplatePublishStatus: editorProcedure
    .input(z.object({
      id: z.string(),
      isPublished: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedTemplate = await ctx.db.template.update({
          where: { id: input.id },
          data: { isPublished: input.isPublished },
        });
        await logActionHelper(ctx, "Update Template Publish Status", "Template", input.id, "normal", input);
        return updatedTemplate;
      } catch (error) {
        console.error("Error updating template publish status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update template publish status",
        });
      }
    }),

    getTemplateGrid: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input: templateId }) => {
      try {
        return await ctx.db.template.findUnique({
          where: { id: templateId },
          include: {
            assignments: {
              include: {
                memetic: {
                  include: {
                    tier: true,
                    tag: true, // Include tag
                  },
                },
              },
            },
          },
        });
      } catch (error) {
        console.error("Error fetching template grid:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch template grid",
        });
      }
    }),

    deleteTemplate: editorProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        const deletedTemplate = await ctx.db.$transaction(async (prisma) => {
          // Delete all associated TemplateAssignments
          await prisma.templateAssignment.deleteMany({
            where: { templateId: input },
          });

          // Delete the template
          const deletedTemplate = await prisma.template.delete({
            where: { id: input },
          });

          // Update the order of remaining templates
          const remainingTemplates = await prisma.template.findMany({
            orderBy: { order: 'asc' },
          });

          await Promise.all(
            remainingTemplates.map((template, index) =>
              prisma.template.update({
                where: { id: template.id },
                data: { order: index + 1 },
              })
            )
          );

          return deletedTemplate;
        });

        await logActionHelper(ctx, "Delete Template", "Template", input, "high", { deletedTemplateId: input });
        return deletedTemplate;
      } catch (error) {
        console.error("Error deleting template:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete template",
        });
      }
    }),

    updateTemplateOrder: editorProcedure
    .input(z.array(z.object({ id: z.string(), order: z.number() })))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.$transaction(async (prisma) => {
          await Promise.all(
            input.map(({ id, order }) =>
              prisma.template.update({
                where: { id },
                data: { order },
              })
            )
          );
        });
        await logActionHelper(ctx, "Update Template Order", "Template", input.map(t => t.id).join(','), "low", { newOrder: input });
        return { success: true };
      } catch (error) {
        console.error("Error updating template order:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update template order",
        });
      }
    }),

  // Fetch all published templates
  getPublishedTemplates: protectedProcedure
    .query(async ({ ctx }) => {
      const templates = await ctx.db.template.findMany({
        where: { isPublished: true },
        include: {
          assignments: {
            include: {
              memetic: {
                include: {
                  tier: true,
                  tag: true,
                },
              },
            },
          },
        },
        orderBy: { order: 'asc' },
      });
      return templates;
    }),
  });

export default templateRouter;