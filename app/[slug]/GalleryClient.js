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

  // 🎨 TYPE
  const textPrimary = {
    color: "#000",
    fontSize: "10px",
    textTransform: "uppercase",
    fontFamily: "Arial, Helvetica, sans-serif",
    letterSpacing: "0.5px",
  };

  const textSecondary = { color: "rgba(0,0,0,0.3)" };
  const textTertiary = { color: "rgba(0,0,0,0.6)" };

  const [gIndex] = useState(currentIndex || 0);

  // 👉 loe URL-ist image index
  const initialImage = parseInt(searchParams.get("image") || "0", 10);

  const [iIndex, setIIndex] = useState(initialImage);
  const [showIndex, setShowIndex] = useState(false);

  // minimal motion
  const [visible, setVisible] = useState(true);

  const gallery = galleries[gIndex];

  if (!gallery || !gallery.images?.length) {
    return <div style={{ padding: 40 }}>No images</div>;
  }

  const images = gallery.images;
  const image = images[iIndex];

  function next() {
    setVisible(false);

    setTimeout(() => {
      if (iIndex < images.length - 1) {
        setIIndex((i) => i + 1);
      } else {
        const nextGallery = (gIndex + 1) % galleries.length;
        router.push(`/${galleries[nextGallery].slug}`);
      }
    }, 40);
  }

  function prev() {
    setVisible(false);

    setTimeout(() => {
      if (iIndex > 0) {
        setIIndex((i) => i - 1);
      } else {
        const prevGallery =
          (gIndex - 1 + galleries.length) % galleries.length;
        router.push(`/${galleries[prevGallery].slug}`);
      }
    }, 40);
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

  const minSwipeDistance = 50;

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

    if (distance > minSwipeDistance) next();
    if (distance < -minSwipeDistance) prev();
  };

  // 📚 INDEX
  if (showIndex) {
    return (
      <div style={{ padding: "5%", background: "#fff" }}>
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
                  src={urlFor(img).width(1200).url()}
                  onClick={() =>
                    router.push(`/${g.slug}?image=${iIdx}`)
                  }
                  style={{ width: "100%", cursor: "pointer" }}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // 🎞️ SLIDESHOW
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
      {/* INDEX */}
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
          zIndex: 5,
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
          zIndex: 5,
        }}
      />

      {/* IMAGE */}
      <img
        key={image._key}
        src={urlFor(image).width(2000).url()}
        onLoad={() => setVisible(true)}
        style={{
          maxWidth: "90%",
          maxHeight: "90%",
          objectFit: "contain",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.995)",
          transition: "opacity 0.25s ease-out, transform 0.25s ease-out",
        }}
      />

      {/* TEXT */}
      <div style={{ position: "absolute", bottom: 20, left: 20 }}>
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
    </div>
  );
}