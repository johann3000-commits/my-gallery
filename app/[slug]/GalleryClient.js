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

  const gallery = galleries[currentIndex];

  if (!gallery || !gallery.images?.length) {
    return <div style={{ padding: 40 }}>No images</div>;
  }

  const images = gallery.images;

  // 🔥 URL → index (1-based)
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

  const textSecondary = { color: "rgba(0,0,0,0.3)" };
  const textTertiary = { color: "rgba(0,0,0,0.6)" };

  function getSrc(img) {
    return urlFor(img).width(1600).dpr(2).quality(90).url();
  }

  // 🔥 NO-JUMP CORE
  const [currentSrc, setCurrentSrc] = useState("");
  const [nextSrc, setNextSrc] = useState("");
  const [fade, setFade] = useState(false);

  const image = images[iIndex];

  useEffect(() => {
    const newSrc = getSrc(image);

    // first render
    if (!currentSrc) {
      setCurrentSrc(newSrc);
      return;
    }

    const img = new Image();
    img.src = newSrc;

    img.onload = () => {
      setNextSrc(newSrc);
      setFade(true);

      setTimeout(() => {
        setCurrentSrc(newSrc);
        setFade(false);
      }, 120);
    };
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

  // ⌨️ keyboard
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

  // 👉 swipe
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

      {/* 🔥 IMAGE STACK */}
      <div
        style={{
          position: "relative",
          width: "90%",
          height: "90%",
        }}
      >
        {currentSrc && (
          <img
            src={currentSrc}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: fade ? 0 : 1,
              transition: "opacity 120ms ease",
            }}
          />
        )}

        {nextSrc && (
          <img
            src={nextSrc}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: fade ? 1 : 0,
              transition: "opacity 120ms ease",
            }}
          />
        )}
      </div>

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
                <div
                  style={{
                    ...textPrimary,
                    gridColumn: "1 / -1",
                    marginTop: "40px",
                  }}
                >
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