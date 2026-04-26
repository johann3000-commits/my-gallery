import GalleryClient from "./GalleryClient";
import { client } from "@/lib/sanity";
import { notFound } from "next/navigation";

export default async function Page({ params }) {
  const { slug } = params;

  // fetch kõik galeriid
  const galleries = await client.fetch(`
    *[_type == "gallery"] | order(order asc) {
      title,
      subtitle,
      "slug": slug.current,
      images
    }
  `);

  // leia õige galerii slugi järgi
  const currentIndex = galleries.findIndex(
    (g) => g.slug === slug
  );

  // kui ei leia → 404 (õige käitumine)
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