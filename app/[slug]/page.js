import GalleryClient from "./GalleryClient";
import { client } from "@/lib/sanity";
import { notFound } from "next/navigation";
import imageUrlBuilder from "@sanity/image-url";

// 👉 helper OG image jaoks
const builder = imageUrlBuilder({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
});

function urlFor(source) {
  return builder.image(source);
}

// 👉 SEO + OG IMAGE
export async function generateMetadata({ params }) {
  const { slug } = await params;

  const gallery = await client.fetch(
    `*[_type == "gallery" && slug.current == $slug][0]{
      title,
      subtitle,
      images
    }`,
    { slug }
  );

  if (!gallery) return {};

  const image = gallery.images?.[0];

  return {
    title: gallery.title,
    description: gallery.subtitle,
    openGraph: {
      title: gallery.title,
      description: gallery.subtitle,
      images: image
        ? [
            {
              url: urlFor(image).width(1200).height(630).url(),
              width: 1200,
              height: 630,
            },
          ]
        : [],
    },
  };
}

// 👉 PAGE
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