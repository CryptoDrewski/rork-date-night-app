import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from "react-native";
import Constants from "expo-constants";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = (): string => {
  const env = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (env) return env;

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  const hostUri = (Constants as any)?.expoConfig?.hostUri as string | undefined;
  if (hostUri) {
    const protocol = hostUri.startsWith("localhost") || hostUri.startsWith("127.") ? "http" : "http";
    const [host, port] = hostUri.split(":");
    if (host && port) return `${protocol}://${host}:${port}`;
    return `${protocol}://${hostUri}`;
  }

  console.warn("EXPO_PUBLIC_RORK_API_BASE_URL not set. Falling back to http://localhost:3000");
  return Platform.select({ web: "http://localhost:3000", default: "http://localhost:3000" }) as string;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
