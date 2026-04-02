import { useEffect, useState } from "react";
import fallbackProductImage from "assets/images/fallback-product.svg";

const DEFAULT_FALLBACK_SRC = fallbackProductImage;

export function SafeImage({ src, fallbackSrc = DEFAULT_FALLBACK_SRC, alt, ...rest }) {
  const [activeSrc, setActiveSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setActiveSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <img
      {...rest}
      alt={alt}
      src={activeSrc}
      onError={() => {
        if (activeSrc !== fallbackSrc) {
          setActiveSrc(fallbackSrc);
        }
      }}
    />
  );
}
