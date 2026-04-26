"use client";

import { useState, useEffect } from "react";
import { urlFor } from "@/lib/sanity";
import React from "react";
import { useRouter } from "next/navigation";

export default function GalleryClient({ galleries, currentIndex }) {
  const router = useRouter();

  if (!galleries || galleries.length === 0) {
    return <div style={{ padding: 40 }}>No galleries</div>;
  }

  // 🎨 TYPOGRAPHY SYSTEM
  const textPrimary = {
    color: "#000",
    fontSize: "10px",
    textTransform: "uppercase",
    fontFamily: "Arial, Helvetica, sans-serif",
    letterSpacing: "0.15px",
  };

  const textSecondary = {
    color: "rgba(0,0,0,0.3)",
  };

  const textTertiary = {
    color: "rgba(0,0,0,0.6)",
  };

  const [gIndex] = useState(currentIndex || 0);
  const [iIndex, setIIndex] = useState(0);
  const [showIndex, setShowIndex] = useState(false);
  const [loaded, setLoaded] = useState(true);

  const gallery = galleries[gIndex];

  if (!gallery || !gallery.images?.length) {
    return <div style={{ padding: 40 }}>No images</div>;
  }

  const images = gallery.images;
  const image = images[iIndex];

  function next() {
    setLoaded(false);

    if (iIndex < images.length - 1) {
      setIIndex(iIndex + 1);
    } else {
      const nextGallery = (gIndex + 1) % galleries.length;
      router.push(`/${galleries[nextGallery].slug}`);
    }
  }

  function prev() {
    setLoaded(false);

    if (iIndex > 0) {
      setIIndex(iIndex - 1);
    } else {
      const prevGallery =
        (gIndex - 1 + galleries.length) % galleries.length;
      router.push(`/${galleries[prevGallery].slug}`);
    }
  }

  // fade control
  useEffect(() => {
    if (iIndex !== 0) setLoaded(false);
  }, [iIndex]);

  // preload
  useEffect(() => {
    const nextImg = images[iIndex + 1];
    const prevImg = images[iIndex - 1];

    if (nextImg) {
      const img = new Image();
      img.src = urlFor(nextImg).width(2000).url();
    }

    if (prevImg) {
      const img = new Image();
      img.src = urlFor(prevImg).width(2000).url();
    }
  }, [iIndex, images]);

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

  // 📚 INDEX VIEW
  if (showIndex) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#fff",
          overflowY: "auto",
          padding: "5%",
        }}
      >
        {/* CLOSE */}
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
              {/* TITLE + SUBTITLE */}
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
                  onClick={() => router.push(`/${g.slug}`)}
                  style={{
                    width: "100%",
                    cursor: "pointer",
                  }}
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
        touchAction: "pan-y",
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
        key={image._key}
        src={urlFor(image).width(2000).url()}
        onLoad={() => setLoaded(true)}
        style={{
          maxWidth: "90%",
          maxHeight: "90%",
          objectFit: "contain",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
      />

      {/* TEXT */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
        }}
      >
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