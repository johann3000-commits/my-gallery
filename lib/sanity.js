import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "yo2y50ix";

const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: true,
});

const builder = imageUrlBuilder(client);

export function urlFor(source) {
  return builder.image(source);
}