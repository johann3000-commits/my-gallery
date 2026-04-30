import { client, urlFor } from "@/lib/sanity";
import GalleryClient from "./GalleryClient";

// 🔥 OG PER GALLERY (safe)
export async function generateMetadata({ params }) {
  try {
    const gallery = await client.fetch(
      `*[_type == "gallery" && slug.current == $slug][0]{
        title,
        subtitle,
        images
      }`,
      { slug: params.slug }
    );

    if (!gallery) return {};

    const ogImage = gallery.images?.[0];

    const imageUrl = ogImage
      ? urlFor(ogImage).width(1200).height(630).fit("crop").url()
      : "/og.jpg";

    return {
      title: gallery.title || "Gallery",
      description: gallery.subtitle || "Photography portfolio",

      openGraph: {
        title: gallery.title || "Gallery",
        description: gallery.subtitle || "",
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
  } catch (e) {
    return {
      title: "Gallery",
      description: "Photography portfolio",
    };
  }
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

  // 🔥 robust slug match
  const currentIndex = galleries.findIndex(
    (g) => String(g.slug) === String(params.slug)
  );

  // 🔥 fallback (väga oluline)
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <GalleryClient
      galleries={galleries}
      currentIndex={safeIndex}
    />
  );
}