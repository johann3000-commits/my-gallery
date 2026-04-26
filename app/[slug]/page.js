import GalleryClient from "./GalleryClient";
import { client } from "@/lib/sanity";

export default async function Page({ params }) {
  const { slug } = await params;

  const galleries = await client.fetch(`
    *[_type == "gallery"] | order(order asc) {
      title,
      subtitle,
      "slug": slug.current,
      images
    }
  `);

  const currentIndex = galleries.findIndex(
    (g) => g.slug === slug
  );

  return (
    <GalleryClient
      galleries={galleries}
      currentIndex={currentIndex === -1 ? 0 : currentIndex}
    />
  );
}