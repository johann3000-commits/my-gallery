import { client, urlFor } from "@/lib/sanity";
import GalleryClient from "./GalleryClient";

// 🔥 OG METADATA PER GALLERY
export async function generateMetadata({ params }) {
  const { slug } = params;

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

  // 👉 võta esimene pilt OG jaoks
  const ogImage = gallery.images?.[0];

  const imageUrl = ogImage
    ? urlFor(ogImage).width(1200).height(630).fit("crop").url()
    : "/og.jpg";

  return {
    title: gallery.title,
    description: gallery.subtitle || "Photography portfolio",

    openGraph: {
      title: gallery.title,
      description: gallery.subtitle || "Photography portfolio",
      url: `https://johann3000.space/${slug}`,
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
      title: gallery.title,
      description: gallery.subtitle || "Photography portfolio",
      images: [imageUrl],
    },
  };
}

// 🔥 PAGE
export default async function Page({ params }) {
  const galleries = await client.fetch(`
    *[_type == "gallery"] | order(_createdAt asc){
      title,
      subtitle,
      "slug": slug.current,
      images
    }
  `);

  const currentIndex = galleries.findIndex(
    (g) => g.slug === params.slug
  );

  return (
    <GalleryClient
      galleries={galleries}
      currentIndex={currentIndex}
    />
  );
}