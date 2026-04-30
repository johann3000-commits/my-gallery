"use client";

import { useState, useEffect } from "react";
import { urlFor } from "@/lib/sanity";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GalleryClient({ galleries, currentIndex }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!galleries || galleries.length === 0) {
    return <div style={{ padding: 40 }}>No galleries</div>;
  }

  const textPrimary = {
    color: "#000",
    fontSize: "10px",
    textTransform: "uppercase",
    fontFamily: "Arial, Helvetica, sans-serif",
    letterSpacing: "0.5px",
  };

  const textSecondary = { color: "rgba(0,0,0,0.3)" };
  const textTertiary = { color: "rgba(0,0,0,0.6)" };

  // 🔥 oluline: EI OLE state
  const gIndex = currentIndex || 0;

  const [showIndex, setShowIndex] = useState(false);

  const gallery = galleries[gIndex];

  if (!gallery || !gallery.images?.length) {
    return <div style={{ padding: 40 }}>No images</div>;
  }

  const images = gallery.images;

  // 🔥 1-based → 0-based
  const imageParam = Number(searchParams.get("image") || 1) - 1;

  const [iIndex, setIIndex] = useState(0);

  // 🔥 URL sync
  useEffect(() => {
    const newIndex = Math.min(
      Math.max(imageParam, 0),
      images.length - 1
    );
    setIIndex(newIndex);
  }, [imageParam, images.length]);

  function updateUrl(index) {
    router.replace(`/${gallery.slug}?image=${index + 1}`);
  }

  function next() {
    if (iIndex < images.length - 1) {
      updateUrl(iIndex + 1);
    } else {
      const nextGallery = (gIndex + 1) % galleries.length;
      router.push(`/${galleries[nextGallery].slug}`);
    }
  }

  function prev() {
    if (iIndex > 0) {
      updateUrl(iIndex - 1);
    } else {
      const prevGallery =
        (gIndex - 1 + galleries.length) % galleries.length;
      router.push(`/${galleries[prevGallery].slug}`);
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

  // swipe
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;

    if (distance > 50) next();
    if (distance < -50) prev();
  };

  const image = images[iIndex];

  // 🔥 NO FLASH
  const [displayedSrc, setDisplayedSrc] = useState(
    urlFor(image).width(1600).dpr(2).quality(90).url()
  );

  useEffect(() => {
    const newSrc = urlFor(image)
      .width(1600)
      .dpr(2)
      .quality(90)
      .url();

    const img = new Image();
    img.src = newSrc;

    if (img.complete) {
      setDisplayedSrc(newSrc);
      return;
    }

    img.onload = () => {
      setDisplayedSrc(newSrc);
    };
  }, [image]);

  // 🔥 PRELOAD
  useEffect(() => {
    const range = 3;

    for (let i = -range; i <= range; i++) {
      const index = iIndex + i;

      if (images[index]) {
        const src = urlFor(images[index])
          .width(1600)
          .dpr(2)
          .quality(90)
          .url();

        const img = new Image();
        img.src = src;
      }
    }
  }, [iIndex, images]);

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
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
      {/* INDEX BUTTON */}
      <div
        onClick={() => setShowIndex(true)}
        style={{
          ...textPrimary,
          position: "absolute",
          top: 20,
          right: 20,
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        Index
      </div>

      {/* CLICK AREAS */}
      <div
        onClick={prev}
        style={{
          position: "absolute",
          left: 0,
          top: "5%",
          width: "50%",
          height: "90%",
        }}
      />
      <div
        onClick={next}
        style={{
          position: "absolute",
          right: 0,
          top: "5%",
          width: "50%",
          height: "90%",
        }}
      />

      {/* IMAGE */}
      <img
        src={displayedSrc}
        style={{
          maxWidth: "90%",
          maxHeight: "90%",
          objectFit: "contain",
        }}
      />

      {/* TEXT */}
      <div className="gallery-text">
        <div style={textPrimary}>{gallery.title}</div>

        {gallery.subtitle && (
          <div style={{ ...textPrimary, ...textSecondary }}>
            {gallery.subtitle}
          </div>
        )}

        <div style={{ ...textPrimary, ...textTertiary }}>
          {iIndex + 1}/{images.length}
        </div>
      </div>

      {/* INDEX OVERLAY */}
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
          <div
            onClick={() => setShowIndex(false)}
            style={{
              ...textPrimary,
              position: "fixed",
              top: 20,
              right: 20,
              cursor: "pointer",
            }}
          >
            Close
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
            }}
          >
            {galleries.map((g) => (
              <React.Fragment key={g.slug}>
                <div
                  style={{
                    ...textPrimary,
                    gridColumn: "1 / -1",
                    display: "flex",
                    gap: "12px",
                    marginTop: "40px",
                  }}
                >
                  <div>{g.title}</div>
                  {g.subtitle && (
                    <div style={textSecondary}>{g.subtitle}</div>
                  )}
                </div>

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