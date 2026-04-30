"use client";

import { useState, useEffect } from "react";
import { urlFor } from "@/lib/sanity";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GalleryClient({ galleries, currentIndex }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const gallery = galleries[currentIndex];
  const images = gallery.images;

  const imageParam = Number(searchParams.get("image") || 1) - 1;
  const iIndex = Math.min(Math.max(imageParam, 0), images.length - 1);

  const [showIndex, setShowIndex] = useState(false);

  function getSrc(img) {
    return urlFor(img).width(1600).dpr(2).quality(90).url();
  }

  // 🔥 CORE: keep old until new ready
  const [displaySrc, setDisplaySrc] = useState("");

  const image = images[iIndex];

  useEffect(() => {
    const newSrc = getSrc(image);

    const img = new Image();
    img.src = newSrc;

    img.decode?.().then(() => {
      setDisplaySrc(newSrc);
    }).catch(() => {
      // fallback
      setDisplaySrc(newSrc);
    });

  }, [image]);

  function updateUrl(index) {
    router.replace(`/${gallery.slug}?image=${index + 1}`);
  }

  function next() {
    if (iIndex < images.length - 1) {
      updateUrl(iIndex + 1);
    } else {
      const nextGallery = (currentIndex + 1) % galleries.length;
      router.push(`/${galleries[nextGallery].slug}?image=1`);
    }
  }

  function prev() {
    if (iIndex > 0) {
      updateUrl(iIndex - 1);
    } else {
      const prevGallery =
        (currentIndex - 1 + galleries.length) % galleries.length;
      router.push(
        `/${galleries[prevGallery].slug}?image=${galleries[prevGallery].images.length}`
      );
    }
  }

  // keyboard
  useEffect(() => {
    const handler = (e) => {
      if (showIndex) return;

      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") setShowIndex(false);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

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
      {/* INDEX */}
      <div
        onClick={() => setShowIndex(true)}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          fontSize: 10,
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        Index
      </div>

      {/* CLICK AREAS */}
      <div onClick={prev} style={{ position: "absolute", left: 0, width: "50%", height: "100%" }} />
      <div onClick={next} style={{ position: "absolute", right: 0, width: "50%", height: "100%" }} />

      {/* 🔥 IMAGE */}
      {displaySrc && (
        <img
          src={displaySrc}
          style={{
            maxWidth: "90%",
            maxHeight: "90%",
            objectFit: "contain",
          }}
        />
      )}

      {/* INDEX GRID */}
      {showIndex && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#fff",
            padding: "5%",
            overflowY: "scroll",
            zIndex: 20,
          }}
        >
          <div onClick={() => setShowIndex(false)}>Close</div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
            }}
          >
            {galleries.map((g) => (
              <React.Fragment key={g.slug}>
                {g.images.map((img, iIdx) => (
                  <img
                    key={`${g.slug}-${iIdx}`}
                    src={urlFor(img).width(800).url()}
                    onClick={() => {
                      router.push(`/${g.slug}?image=${iIdx + 1}`);
                      setShowIndex(false);
                    }}
                    style={{ width: "100%", cursor: "pointer" }}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}