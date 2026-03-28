import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { generateIdeasProcedure } from "./routes/ideas/generate/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  ideas: createTRPCRouter({
    generate: generateIdeasProcedure,
  }),
});

export type AppRouter = typeof appRouter;
