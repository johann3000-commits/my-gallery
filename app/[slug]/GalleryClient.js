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

  const [currentSrc, setCurrentSrc] = useState("");
  const [nextSrc, setNextSrc] = useState("");
  const [visible, setVisible] = useState(true);

  function getSrc(img) {
    return urlFor(img).width(1600).dpr(2).quality(90).url();
  }

  // 🔥 CORE FIX (no jump ever)
  useEffect(() => {
    const newSrc = getSrc(images[iIndex]);

    const img = new Image();
    img.src = newSrc;

    img.onload = () => {
      setNextSrc(newSrc);
      setVisible(false);

      setTimeout(() => {
        setCurrentSrc(newSrc);
        setVisible(true);
      }, 120);
    };
  }, [iIndex]);

  function updateUrl(index) {
    router.replace(`/${gallery.slug}?image=${index + 1}`);
  }

  function next() {
    if (iIndex < images.length - 1) updateUrl(iIndex + 1);
  }

  function prev() {
    if (iIndex > 0) updateUrl(iIndex - 1);
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
      {/* CLICK */}
      <div onClick={prev} style={{ position: "absolute", left: 0, width: "50%", height: "100%" }} />
      <div onClick={next} style={{ position: "absolute", right: 0, width: "50%", height: "100%" }} />

      {/* 🔥 IMAGE STACK */}
      <div style={{ position: "relative", width: "90%", height: "90%" }}>
        
        {/* CURRENT */}
        {currentSrc && (
          <img
            src={currentSrc}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: visible ? 1 : 0,
              transition: "opacity 120ms ease",
            }}
          />
        )}

        {/* NEXT */}
        {nextSrc && (
          <img
            src={nextSrc}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: visible ? 0 : 1,
              transition: "opacity 120ms ease",
            }}
          />
        )}
      </div>

      {/* INDEX */}
      <div
        onClick={() => setShowIndex(true)}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          fontSize: 10,
          cursor: "pointer",
        }}
      >
        Index
      </div>

      {/* INDEX GRID */}
      {showIndex && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#fff",
            padding: "5%",
            zIndex: 20,
          }}
        >
          <div onClick={() => setShowIndex(false)}>Close</div>

          {galleries.map((g) =>
            g.images.map((img, iIdx) => (
              <img
                key={iIdx}
                src={urlFor(img).width(800).url()}
                onClick={() => {
                  router.push(`/${g.slug}?image=${iIdx + 1}`);
                  setShowIndex(false);
                }}
                style={{ width: "100%" }}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}