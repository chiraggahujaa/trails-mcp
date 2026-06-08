// The six Waymarked Trails "flavours" (activity maps). Each is a separate
// subdomain hosting the same API shape.
import { z } from "zod";

export const FLAVOURS = ["hiking", "cycling", "mtb", "riding", "skating", "slopes"] as const;

export type Flavour = (typeof FLAVOURS)[number];

/** Shared zod field for tools, defaulting to hiking. */
export const flavourSchema = z
  .enum(FLAVOURS)
  .default("hiking")
  .describe(
    "Which activity map to query: hiking, cycling, mtb (mountain biking), riding " +
      "(horse), skating (inline), or slopes (ski/winter). Defaults to hiking.",
  );

/** Shared zod field for the response language. */
export const languageSchema = z
  .string()
  .default("en")
  .describe("Preferred language for names (BCP-47 code, e.g. 'en', 'de', 'fr').");

export function baseUrl(flavour: Flavour): string {
  return `https://${flavour}.waymarkedtrails.org/api/v1`;
}
