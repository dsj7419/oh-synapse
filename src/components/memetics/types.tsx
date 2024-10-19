import { type Prisma } from "@prisma/client";

export type Tier = Prisma.TierGetPayload<{}>;
export type Tag = Prisma.TagGetPayload<{}>;
export type Memetic = Prisma.MemeticGetPayload<{
  include: { tier: true; tag: true };
}>;
export type TemplateAssignment = Prisma.TemplateAssignmentGetPayload<{
  include: { memetic: { include: { tier: true; tag: true } } };
}>;
export type Template = Prisma.TemplateGetPayload<{
  include: {
    assignments: {
      include: { memetic: { include: { tier: true; tag: true } } };
    };
  };
}>;
export type User = Prisma.UserGetPayload<{}>;
export type TablePlayer = Prisma.TablePlayerGetPayload<{
  include: {
    user: true;
    selections: {
      include: { memetic: { include: { tier: true; tag: true } } };
    };
  };
}>;
export type Table = Prisma.TableGetPayload<{
  include: {
    owner: true;
    template: {
      include: {
        assignments: {
          include: { memetic: { include: { tier: true; tag: true } } };
        };
      };
    };
    players: {
      include: {
        user: true;
        selections: {
          include: { memetic: { include: { tier: true; tag: true } } };
        };
      };
    };
  };
}>;

export type RemoveMemeticInput = {
  tableId: string;
  memeticId: string;
  playerId: string;
};
