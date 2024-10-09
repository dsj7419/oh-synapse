import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { THEME_DEFAULTS } from '@/defaults/themeDefaults';
import type { Theme } from '@/defaults/themeDefaults';

const themeSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  appearance: z.enum(['light', 'dark']),
  accentColor: z.enum([
    'gray', 'gold', 'bronze', 'brown', 'yellow', 'amber', 'orange', 'tomato',
    'red', 'ruby', 'crimson', 'pink', 'plum', 'purple', 'violet', 'iris',
    'indigo', 'blue', 'cyan', 'teal', 'jade', 'green', 'grass', 'lime',
    'mint', 'sky',
  ]),
  grayColor: z.enum(['auto', 'gray', 'mauve', 'slate', 'sage', 'olive', 'sand']),
  primaryColor: z.string(),
  font: z.string(),
  layout: z.string(),
  radius: z.enum(['none', 'small', 'medium', 'large', 'full']),
  scaling: z.enum(['90%', '95%', '100%', '105%', '110%']),
  panelBackground: z.enum(['solid', 'translucent']),
  typographyScale: z.enum(['90%', '95%', '100%', '105%', '110%']),
  smokeSpeed: z.number().optional(),
  smokeOpacity: z.number().optional(),
  saturationAdjust: z.number().optional(),
  lightnessAdjust: z.number().optional(),
  spotlightIntensity: z.number().optional(),
  spotlightDistance: z.number().optional(),
  spotlightAngle: z.number().optional(),
  spotlightPenumbra: z.number().optional(),
  spotlightColor: z.string().optional(),
  spotlightEnabled: z.boolean().optional(),
  updatedAt: z.date().optional(),
  webglLogoText: z.string(),
  webglLogoFontSize: z.number(),
  webglLogoFontFamily: z.string(),
  webglLogoColor: z.string(),
  webglLogoAnimSpeed: z.number(),
  webglLogoInterRadius: z.number(),
  webglLargeText: z.string(),
  webglLargeFontSize: z.number(),
  webglLargeFontFamily: z.string(),
  webglLargeColor: z.string(),
  webglLargeAnimSpeed: z.number(),
  webglLargeInterRadius: z.number(),
  webglLargeChangeInterval: z.number(),
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
        update: {
          name: input.theme.name,
          appearance: input.theme.appearance,
          accentColor: input.theme.accentColor,
          grayColor: input.theme.grayColor,
          primaryColor: input.theme.primaryColor,
          font: input.theme.font,
          layout: input.theme.layout,
          radius: input.theme.radius,
          scaling: input.theme.scaling,
          panelBackground: input.theme.panelBackground,
          typographyScale: input.theme.typographyScale,
          smokeSpeed: input.theme.smokeSpeed ?? 0.001,
          smokeOpacity: input.theme.smokeOpacity ?? 0.3,
          saturationAdjust: input.theme.saturationAdjust ?? 1,
          lightnessAdjust: input.theme.lightnessAdjust ?? 1,
          spotlightIntensity: input.theme.spotlightIntensity ?? 1.5,
          spotlightDistance: input.theme.spotlightDistance ?? 1000,
          spotlightAngle: input.theme.spotlightAngle ?? Math.PI / 6,
          spotlightPenumbra: input.theme.spotlightPenumbra ?? 0,
          spotlightColor: input.theme.spotlightColor ?? "#ffffff",
          spotlightEnabled: input.theme.spotlightEnabled ?? true,
          webglLogoText: input.theme.webglLogoText,
          webglLogoFontSize: input.theme.webglLogoFontSize,
          webglLogoFontFamily: input.theme.webglLogoFontFamily,
          webglLogoColor: input.theme.webglLogoColor,
          webglLogoAnimSpeed: input.theme.webglLogoAnimSpeed,
          webglLogoInterRadius: input.theme.webglLogoInterRadius,
          webglLargeText: input.theme.webglLargeText,
          webglLargeFontSize: input.theme.webglLargeFontSize,
          webglLargeFontFamily: input.theme.webglLargeFontFamily,
          webglLargeColor: input.theme.webglLargeColor,
          webglLargeAnimSpeed: input.theme.webglLargeAnimSpeed,
          webglLargeInterRadius: input.theme.webglLargeInterRadius,
          webglLargeChangeInterval: input.theme.webglLargeChangeInterval,
        },
        create: {
          id: 'site_theme_id',
          ...input.theme,
        },
      });
    }),

  getTheme: publicProcedure
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
        panelBackground: (theme?.panelBackground as Theme['panelBackground']) ?? THEME_DEFAULTS.panelBackground,
        typographyScale: (theme?.typographyScale as Theme['typographyScale']) ?? THEME_DEFAULTS.typographyScale,
        smokeSpeed: theme?.smokeSpeed ?? THEME_DEFAULTS.smokeSpeed,
        smokeOpacity: theme?.smokeOpacity ?? THEME_DEFAULTS.smokeOpacity,
        saturationAdjust: theme?.saturationAdjust ?? THEME_DEFAULTS.saturationAdjust,
        lightnessAdjust: theme?.lightnessAdjust ?? THEME_DEFAULTS.lightnessAdjust,
        spotlightIntensity: theme?.spotlightIntensity ?? THEME_DEFAULTS.spotlightIntensity,
        spotlightDistance: theme?.spotlightDistance ?? THEME_DEFAULTS.spotlightDistance,
        spotlightAngle: theme?.spotlightAngle ?? THEME_DEFAULTS.spotlightAngle,
        spotlightPenumbra: theme?.spotlightPenumbra ?? THEME_DEFAULTS.spotlightPenumbra,
        spotlightColor: theme?.spotlightColor ?? THEME_DEFAULTS.spotlightColor,
        spotlightEnabled: theme?.spotlightEnabled ?? THEME_DEFAULTS.spotlightEnabled,
        updatedAt: theme?.updatedAt ?? new Date(),
        webglLogoText: theme?.webglLogoText ?? THEME_DEFAULTS.webglLogoText,
        webglLogoFontSize: theme?.webglLogoFontSize ?? THEME_DEFAULTS.webglLogoFontSize,
        webglLogoFontFamily: theme?.webglLogoFontFamily ?? THEME_DEFAULTS.webglLogoFontFamily,
        webglLogoColor: theme?.webglLogoColor ?? THEME_DEFAULTS.webglLogoColor,
        webglLogoAnimSpeed: theme?.webglLogoAnimSpeed ?? THEME_DEFAULTS.webglLogoAnimSpeed,
        webglLogoInterRadius: theme?.webglLogoInterRadius ?? THEME_DEFAULTS.webglLogoInterRadius,
        webglLargeText: theme?.webglLargeText ?? THEME_DEFAULTS.webglLargeText,
        webglLargeFontSize: theme?.webglLargeFontSize ?? THEME_DEFAULTS.webglLargeFontSize,
        webglLargeFontFamily: theme?.webglLargeFontFamily ?? THEME_DEFAULTS.webglLargeFontFamily,
        webglLargeColor: theme?.webglLargeColor ?? THEME_DEFAULTS.webglLargeColor,
        webglLargeAnimSpeed: theme?.webglLargeAnimSpeed ?? THEME_DEFAULTS.webglLargeAnimSpeed,
        webglLargeInterRadius: theme?.webglLargeInterRadius ?? THEME_DEFAULTS.webglLargeInterRadius,
        webglLargeChangeInterval: theme?.webglLargeChangeInterval ?? THEME_DEFAULTS.webglLargeChangeInterval,
      };
      
      return mergedTheme;
    }),
});