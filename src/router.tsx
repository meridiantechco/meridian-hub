import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { createConfiguredQueryClient } from "./lib/queryClient";

export const getRouter = () => {
  const queryClient = createConfiguredQueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadDelay: 50,
    defaultPreloadStaleTime: 1000 * 60 * 2,
  });

  return router;
};
