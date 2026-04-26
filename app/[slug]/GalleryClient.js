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

  const gallery = galleries[gIndex];

  if (!gallery || !gallery.images || gallery.images.length === 0) {
    return <div>No images</div>;
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

  // preload järgmine
  useEffect(() => {
    const nextIndex = iIndex + 1;
    if (images[nextIndex]) {
      const img = new Image();
      img.src = urlFor(images[nextIndex]).width(2000).url();
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

  // 🔳 INDEX VIEW
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
        {/* Close */}
        <div
          onClick={() => setShowIndex(false)}
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            cursor: "pointer",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "10px",
            textTransform: "uppercase",
            color: "#000",
            zIndex: 10,
          }}
        >
          Close
        </div>

        {/* GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          {galleries.map((g, gIdx) => (
            <React.Fragment key={g.slug}>
              {/* TITLE + SUBTITLE */}
              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  gap: "12px",
                  alignItems: "baseline",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  marginTop: gIdx === 0 ? "0" : "40px",
                  marginBottom: "10px",
                  color: "#000",
                }}
              >
                <div>{g.title}</div>

                {g.subtitle && (
                  <div style={{ opacity: 0.5 }}>
                    {g.subtitle}
                  </div>
                )}
              </div>

              {/* IMAGES */}
              {g.images.map((img, iIdx) => (
                <img
                  key={`${g.slug}-${iIdx}`}
                  src={urlFor(img).width(1200).url()}
                  onClick={() => {
                    router.push(`/${g.slug}`);
                  }}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
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
          cursor: "pointer",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "10px",
          textTransform: "uppercase",
          color: "#000",
          zIndex: 10,
        }}
      >
        Index
      </div>

      {/* LEFT */}
      <div
        onClick={prev}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "50%",
          height: "100%",
          cursor: "w-resize",
          zIndex: 1,
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
          cursor: "e-resize",
          zIndex: 1,
        }}
      />

      {/* IMAGE */}
      <div
        style={{
          width: "90%",
          height: "90%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={urlFor(image).width(2000).url()}
          alt=""
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      {/* TEXT */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          color: "#000",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        <div>{gallery.title}</div>

        {gallery.subtitle && (
          <div style={{ opacity: 0.6 }}>
            {gallery.subtitle}
          </div>
        )}

        <div>
          {iIndex + 1}/{images.length}
        </div>
      </div>
    </div>
  );
}