import { type Template, type Memetic, type Tier, type Tag } from '@prisma/client';

export type TemplateWithAssignments = Template & {
  assignments: {
    memetic: Memetic & { tier: Tier | null; tag: Tag | null };
    rank: number;
  }[];
};
