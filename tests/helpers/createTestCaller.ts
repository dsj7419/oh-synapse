import type { Session } from 'next-auth';
import { createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

export const createTestCaller = async (session: Session | null) => {
  const context = await createTRPCContext({
    headers: new Headers(),
    input: {}
  });
 
  // Manually set the session after context creation
  context.session = session;
  return createCaller(context);
};