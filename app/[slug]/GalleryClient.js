"use client";

import { useState } from "react";
import { urlFor } from "@/lib/sanity";
import { useRouter } from "next/navigation";

export default function GalleryClient({ galleries, currentIndex }) {
  const router = useRouter();

  // 🔥 safety
  if (!galleries || galleries.length === 0) {
    return <div style={{ padding: 40 }}>No galleries</div>;
  }

  const [gIndex, setGIndex] = useState(currentIndex || 0);
  const [iIndex, setIIndex] = useState(0);

  const gallery = galleries[gIndex];

  // 🔥 safety
  if (!gallery || !gallery.images || gallery.images.length === 0) {
    return <div style={{ padding: 40 }}>No images</div>;
  }

  const images = gallery.images;
  const image = images[iIndex];

  function next() {
    if (iIndex < images.length - 1) {
      setIIndex(iIndex + 1);
    } else {
      const nextGallery = (gIndex + 1) % galleries.length;
      router.push(`/${galleries[nextGallery].slug}`);
    }
  }

  function prev() {
    if (iIndex > 0) {
      setIIndex(iIndex - 1);
    } else {
      const prevGallery =
        (gIndex - 1 + galleries.length) % galleries.length;
      router.push(`/${galleries[prevGallery].slug}`);
    }
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* LEFT */}
      <div
        onClick={prev}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "50%",
          height: "100%",
        }}
      />

      {/* RIGHT */}
      <div
        onClick={next}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: "50%",
          height: "100%",
        }}
      />

      {/* IMAGE */}
      <img
        src={urlFor(image).width(2000).url()}
        alt=""
        style={{
          maxWidth: "90%",
          maxHeight: "90%",
          objectFit: "contain",
        }}
      />

      {/* TEXT */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          fontSize: "10px",
          textTransform: "uppercase",
        }}
      >
        <div>{gallery.title}</div>
        <div>
          {iIndex + 1}/{images.length}
        </div>
      </div>
    </div>
  );
}