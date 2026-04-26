"use client";

import { useState, useEffect } from "react";
import { urlFor } from "@/lib/sanity";
import React from "react";
import { useRouter } from "next/navigation";

export default function GalleryClient({ galleries, currentIndex }) {
  const router = useRouter();

  const [gIndex, setGIndex] = useState(currentIndex);
  const [iIndex, setIIndex] = useState(0);
  const [showIndex, setShowIndex] = useState(false);

  const [loaded, setLoaded] = useState(false);

  // swipe
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const gallery = galleries[gIndex];
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

  // preload NEXT + PREV
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

  // INDEX
  if (showIndex) {
    return (
      <div style={{ padding: "5%", background: "#fff" }}>
        <div
          onClick={() => setShowIndex(false)}
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            cursor: "pointer",
            fontSize: "10px",
            textTransform: "uppercase",
            zIndex: 10,
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
                  gridColumn: "1 / -1",
                  display: "flex",
                  gap: "12px",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  marginTop: "40px",
                }}
              >
                <div>{g.title}</div>
                {g.subtitle && (
                  <div style={{ opacity: 0.5 }}>{g.subtitle}</div>
                )}
              </div>

              {g.images.map((img, iIdx) => (
                <img
                  key={iIdx}
                  src={urlFor(img).width(1200).url()}
                  onClick={() => router.push(`/${g.slug}`)}
                  style={{ width: "100%", cursor: "pointer" }}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

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
          position: "absolute",
          top: 20,
          right: 20,
          fontSize: "10px",
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
          cursor: "w-resize",
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
          cursor: "e-resize",
        }}
      />

      {/* IMAGE + FADE */}
      <img
        key={image._key}
        src={urlFor(image).width(2000).url()}
        onLoad={() => setLoaded(true)}
        style={{
          maxWidth: "90%",
          maxHeight: "90%",
          objectFit: "contain",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease",
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
        {gallery.subtitle && <div>{gallery.subtitle}</div>}
        <div>
          {iIndex + 1}/{images.length}
        </div>
      </div>
    </div>
  );
}