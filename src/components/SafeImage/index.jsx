import { useEffect, useState } from "react";
import fallbackProductImage from "assets/images/fallback-product.svg";

const DEFAULT_FALLBACK_SRC = fallbackProductImage;

export function SafeImage({ src, fallbackSrc = DEFAULT_FALLBACK_SRC, alt, className = "", ...rest }) {
  const [activeSrc, setActiveSrc] = useState(src || fallbackSrc);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const nextSrc = src || fallbackSrc;

    const finalizeLoad = (resolvedSrc) => {
      if (cancelled) {
        return;
      }

      setActiveSrc(resolvedSrc);
      setIsLoaded(true);
    };

    const preload = (candidateSrc, nextFallbackSrc) => {
      setActiveSrc(candidateSrc);
      setIsLoaded(false);

      const image = new window.Image();
      image.src = candidateSrc;
      image.onload = () => finalizeLoad(candidateSrc);
      image.onerror = () => {
        if (candidateSrc !== nextFallbackSrc) {
          preload(nextFallbackSrc, nextFallbackSrc);
          return;
        }

        finalizeLoad(nextFallbackSrc);
      };
    };

    preload(nextSrc, fallbackSrc);

    return () => {
      cancelled = true;
    };
  }, [src, fallbackSrc]);

  return (
    <div className={`safe-image-frame ${isLoaded ? "is-loaded" : ""}`}>
      {!isLoaded ? <span className="skeleton-block safe-image-skeleton" aria-hidden="true" /> : null}
      <img
        {...rest}
        alt={alt}
        className={`safe-image-img ${className}`.trim()}
        src={activeSrc}
      />
    </div>
  );
}
