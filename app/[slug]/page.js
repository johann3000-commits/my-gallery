import { client } from "@/lib/sanity";
import { redirect } from "next/navigation";

export default async function Home() {
  const galleries = await client.fetch(`
    *[_type == "gallery"] | order(order asc) {
      "slug": slug.current
    }
  `);

  // kui pole ühtegi galeriid
  if (!galleries || galleries.length === 0) {
    return <div>No galleries found</div>;
  }

  // võta esimene
  const firstSlug = galleries[0].slug;

  redirect(`/${firstSlug}`);
}