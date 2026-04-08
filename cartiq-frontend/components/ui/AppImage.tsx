"use client";

import React, { useState } from "react";
import Image from "next/image";

interface AppImageProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  onClick?: () => void;
  [key: string]: any;
}

export default function AppImage({
  src,
  alt = "product image",
  width,
  height,
  className = "",
  fill = false,
  onClick,
  ...props
}: AppImageProps) {

  // 🔴 MOST IMPORTANT FIX
  // Never allow empty src
  const safeSrc =
    !src || src.trim() === ""
      ? "/assets/images/no_image.png"
      : src;

  const [imgSrc, setImgSrc] = useState(safeSrc);

  const handleError = () => {
    setImgSrc("/assets/images/no_image.png");
  };

  // External images (MongoDB URLs like picsum)
  const isExternal =
    imgSrc.startsWith("http://") || imgSrc.startsWith("https://");

  // If external → use normal <img>
  if (isExternal) {
    if (fill) {
      return (
        <div className={`relative ${className}`}>
          <img
            src={imgSrc}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover"
            onError={handleError}
            onClick={onClick}
          />
        </div>
      );
    }

    return (
      <img
        src={imgSrc}
        alt={alt}
        width={width || 400}
        height={height || 300}
        className={className}
        onError={handleError}
        onClick={onClick}
      />
    );
  }

  // Local images → Next Image
  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={className}
        onError={handleError}
        {...props}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width || 400}
      height={height || 300}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}