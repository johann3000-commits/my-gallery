import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

// 👉 Sanity client
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: true,
});

// 👉 Image URL builder (kasutab clientit — see on oluline!)
const builder = imageUrlBuilder(client);

// 👉 helper function
export function urlFor(source) {
  return builder.image(source);
}