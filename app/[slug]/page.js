import { client, urlFor } from "@/lib/sanity";
import GalleryClient from "./GalleryClient";

// 🔥 OG PER PAGE
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const gallery = await client.fetch(
    `*[_type == "gallery" && slug.current == $slug][0]{
      title,
      subtitle,
      images
    }`,
    { slug }
  );

  if (!gallery) {
    return {};
  }

  const ogImage = gallery.images?.[0];

  const imageUrl = ogImage
    ? urlFor(ogImage)
        .width(1200)
        .height(630)
        .fit("crop")
        .url()
    : "https://johann3000.space/og.jpg";

  return {
    title: gallery.title,
    description: gallery.subtitle || "Photography portfolio",

    openGraph: {
      title: gallery.title,
      description: gallery.subtitle,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      images: [imageUrl],
    },
  };
}

// 🔥 PAGE
export default async function Page({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const galleries = await client.fetch(`
    *[_type == "gallery"] | order(_createdAt asc){
      title,
      subtitle,
      "slug": slug.current,
      images
    }
  `);

  const currentIndex = galleries.findIndex(
    (g) => String(g.slug) === String(slug)
  );

  const safeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <GalleryClient
      key={slug}
      galleries={galleries}
      currentIndex={safeIndex}
    />
  );
}