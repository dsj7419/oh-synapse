// src/server/api/routers/playgroundRouter.ts

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { THEME_DEFAULTS } from '@/defaults/themeDefaults';
import type { Theme } from '@/defaults/themeDefaults';

const themeSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  appearance: z.enum(['light', 'dark']),
  accentColor: z.enum([
    'gray',
    'gold',
    'bronze',
    'brown',
    'yellow',
    'amber',
    'orange',
    'tomato',
    'red',
    'ruby',
    'crimson',
    'pink',
    'plum',
    'purple',
    'violet',
    'iris',
    'indigo',
    'blue',
    'cyan',
    'teal',
    'jade',
    'green',
    'grass',
    'lime',
    'mint',
    'sky',
  ]),
  grayColor: z.enum(['auto', 'gray', 'mauve', 'slate', 'sage', 'olive', 'sand']),
  primaryColor: z.string(),
  font: z.string(),
  layout: z.string(),
  radius: z.enum(['none', 'small', 'medium', 'large', 'full']),
  scaling: z.enum(['90%', '95%', '100%', '105%', '110%']),
  panelBackground: z.enum(['solid', 'translucent']),
  updatedAt: z.date().optional(),
});

export const playgroundRouter = createTRPCRouter({
  saveTheme: protectedProcedure
    .input(
      z.object({
        theme: themeSchema.omit({ id: true, updatedAt: true }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new Error('Unauthorized: No session found');
      }

      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { roles: { select: { role: true } } },
      });

      if (!user?.roles.some((role) => ['admin', 'content_manager'].includes(role.role.name))) {
        throw new Error('Unauthorized');
      }

      return await ctx.db.siteTheme.upsert({
        where: { id: 'site_theme_id' },
        update: { ...input.theme },
        create: { ...input.theme, id: 'site_theme_id' },
      });
    }),

  getTheme: protectedProcedure
    .output(themeSchema)
    .query(async ({ ctx }) => {
      const theme = await ctx.db.siteTheme.findUnique({
        where: { id: 'site_theme_id' },
      });

      const mergedTheme: Theme = {
        id: 'site_theme_id',
        name: theme?.name ?? THEME_DEFAULTS.name,
        appearance: (theme?.appearance as Theme['appearance']) ?? THEME_DEFAULTS.appearance,
        accentColor: (theme?.accentColor as Theme['accentColor']) ?? THEME_DEFAULTS.accentColor,
        grayColor: (theme?.grayColor as Theme['grayColor']) ?? THEME_DEFAULTS.grayColor,
        primaryColor: theme?.primaryColor ?? THEME_DEFAULTS.primaryColor,
        font: theme?.font ?? THEME_DEFAULTS.font,
        layout: theme?.layout ?? THEME_DEFAULTS.layout,
        radius: (theme?.radius as Theme['radius']) ?? THEME_DEFAULTS.radius,
        scaling: (theme?.scaling as Theme['scaling']) ?? THEME_DEFAULTS.scaling,
        panelBackground:
          (theme?.panelBackground as Theme['panelBackground']) ?? THEME_DEFAULTS.panelBackground,
        updatedAt: theme?.updatedAt ?? new Date(),
      };

      return mergedTheme;
    }),
});
