import { client } from "@/lib/sanity";
import { redirect } from "next/navigation";

export default async function Home() {
  const galleries = await client.fetch(`
    *[_type == "gallery"] | order(order asc) {
      "slug": slug.current
    }
  `);

  // leia esimene, millel on päris slug
  const firstGallery = galleries?.find(
    (g) => g.slug && g.slug !== "undefined"
  );

  // kui ei leia → ära redirecti (väldib loopi)
  if (!firstGallery) {
    return <div>No valid gallery</div>;
  }

  // 🔥 redirect ainult siis kui slug on olemas
  redirect(`/${firstGallery.slug}`);
}