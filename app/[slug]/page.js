import GalleryClient from "./GalleryClient";
import { client } from "@/lib/sanity";
import { notFound } from "next/navigation";

export default async function Page({ params }) {
  const { slug } = await params; // 👈 SEE on oluline fix

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

  if (currentIndex === -1) {
    notFound();
  }

  return (
    <GalleryClient
      galleries={galleries}
      currentIndex={currentIndex}
    />
  );
}