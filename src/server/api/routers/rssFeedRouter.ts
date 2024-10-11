import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { RssFeedService } from "@/services/RssFeedService";
import { FeedType, RssFeed } from "@/components/rss-feeds/types/FeedTypes";

const feedTypeEnum = z.enum(['youtube', 'twitter', 'generic']);

export const rssFeedRouter = createTRPCRouter({
  fetchAndStore: protectedProcedure
    .input(z.object({
      url: z.string().url(),
      title: z.string().nullable(), 
      keywords: z.array(z.string()).default([]),
      showInTicker: z.boolean().optional(),
      iconUrl: z.string().optional(),
      type: feedTypeEnum.default('generic'),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const newFeed = await ctx.db.rssFeed.create({
          data: {
            url: input.url,
            title: input.title,
            keywords: input.keywords,
            showInTicker: input.showInTicker ?? true,
            iconUrl: input.iconUrl,
            type: input.type,
            lastFetched: new Date(),
          },
        });
        await RssFeedService.fetchAndUpdateFeed(ctx, newFeed as RssFeed);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch and store RSS feed",
        });
      }
    }),

  getAll: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      cursor: z.string().nullish(),
      type: feedTypeEnum.optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor, type } = input;
      const items = await ctx.db.rssFeed.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { lastFetched: 'desc' },
        where: type ? { type } : undefined,
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }
      return {
        items,
        nextCursor,
      };
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.rssFeed.delete({ where: { id: input } });
    }),

  refresh: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const feed = await ctx.db.rssFeed.findUnique({ where: { id: input } });
      if (!feed) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Feed not found",
        });
      }
      await RssFeedService.fetchAndUpdateFeed(ctx, feed);
      return { success: true };
    }),

  updateKeywords: protectedProcedure
    .input(z.object({
      id: z.string(),
      keywords: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      await RssFeedService.updateFeedKeywords(ctx, input.id, input.keywords);
      return { success: true };
    }),

  updateFeed: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().nullable(),
      keywords: z.array(z.string()),
      type: feedTypeEnum,
      showInTicker: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const updatedFeed = await ctx.db.rssFeed.update({
        where: { id: input.id },
        data: {
          title: input.title,
          keywords: input.keywords,
          type: input.type,
          showInTicker: input.showInTicker,
        },
      });
      await RssFeedService.fetchAndUpdateFeed(ctx, updatedFeed as RssFeed);
      return updatedFeed;
    }),

    manualUpdateAll: protectedProcedure.mutation(async ({ ctx }) => {
      try {
        const feeds = await ctx.db.rssFeed.findMany();
        for (const feed of feeds) {
          await RssFeedService.fetchAndUpdateFeed(ctx, feed as RssFeed);
        }
        return { success: true, message: 'RSS feeds updated successfully' };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update all RSS feeds',
        });
      }
    }),

  updateTickerSettings: protectedProcedure
    .input(z.object({
      speed: z.number().min(1),
      pauseOnHover: z.boolean(),
      spacing: z.number().min(0).max(10),
      maxItemsPerFeed: z.number().min(1).max(50),
    }))
    .mutation(async ({ ctx, input }) => {
      const settings = await ctx.db.tickerSettings.upsert({
        where: { id: 'singleton' },
        update: input,
        create: { ...input, id: 'singleton' },
      });
      return settings;
    }),

  getTickerSettings: publicProcedure
    .query(async ({ ctx }) => {
      const settings = await ctx.db.tickerSettings.findUnique({
        where: { id: 'singleton' },
      });
      return settings || { speed: 30, pauseOnHover: true, spacing: 0, maxItemsPerFeed: 5 };
    }),

  getTickerItems: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(({ ctx, input }) => {
      return RssFeedService.getTickerItems(ctx, input.limit);
    }),

  getFullFeedItems: publicProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
    }))
    .query(({ ctx, input }) => {
      return RssFeedService.getFullFeedItems(ctx, input.page, input.pageSize);
    }),

  getFeedItems: publicProcedure
    .input(z.object({
      feedId: z.string(),
      limit: z.number().min(1).max(50).default(10),
      cursor: z.string().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const { feedId, limit, cursor } = input;
      const items = await ctx.db.rssItem.findMany({
        where: { feedId },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { pubDate: 'desc' },
        include: {
          youtubeItem: true,
          twitterItem: true,
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }
      return {
        items,
        nextCursor,
      };
    }),
});