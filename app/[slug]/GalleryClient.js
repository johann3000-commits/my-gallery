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

  const textPrimary = {
    color: "#000",
    fontSize: "10px",
    textTransform: "uppercase",
    fontFamily: "Arial, Helvetica, sans-serif",
    letterSpacing: "0.5px",
  };

  function getSrc(img) {
    return urlFor(img).width(1600).dpr(2).quality(90).url();
  }

  const src = getSrc(images[iIndex]);

  function updateUrl(index) {
    router.replace(`/${gallery.slug}?image=${index + 1}`);
  }

  function next() {
    if (iIndex < images.length - 1) {
      updateUrl(iIndex + 1);
    }
  }

  function prev() {
    if (iIndex > 0) {
      updateUrl(iIndex - 1);
    }
  }

  // 🔥 KEYBOARD
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

  // 🔥 SWIPE
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

  // 🔥 FULL GLOBAL PRELOAD (SMART)
  useEffect(() => {
    const allSrcs = [];

    galleries.forEach((g) => {
      g.images.forEach((img) => {
        allSrcs.push(getSrc(img));
      });
    });

    const unique = [...new Set(allSrcs)];

    let index = 0;

    function loadBatch() {
      const batchSize = 4;

      for (let i = 0; i < batchSize && index < unique.length; i++) {
        const img = new Image();
        img.src = unique[index];
        index++;
      }

      if (index < unique.length) {
        requestIdleCallback(loadBatch);
      }
    }

    requestIdleCallback(loadBatch);
  }, [galleries]);

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
        style={{ position: "absolute", left: 0, width: "50%", height: "100%" }}
      />
      <div
        onClick={next}
        style={{ position: "absolute", right: 0, width: "50%", height: "100%" }}
      />

      {/* IMAGE */}
      <img
        src={src}
        style={{
          maxWidth: "90%",
          maxHeight: "90%",
          objectFit: "contain",
        }}
      />

      {/* TEXT */}
      <div style={{ position: "absolute", bottom: 20, left: 20 }}>
        <div style={textPrimary}>{gallery.title}</div>
        {gallery.subtitle && (
          <div style={{ ...textPrimary, color: "rgba(0,0,0,0.3)" }}>
            {gallery.subtitle}
          </div>
        )}
        <div style={{ ...textPrimary, color: "rgba(0,0,0,0.6)" }}>
          {iIndex + 1}/{images.length}
        </div>
      </div>

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
                <div style={{ ...textPrimary, gridColumn: "1 / -1" }}>
                  {g.title}
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