import React from "react";

interface SkeletonProps {
  count?: number;
  width?: string;
  height?: string;
  circle?: boolean;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  count = 1,
  width = "100%",
  height = "20px",
  circle = false,
  className = "",
}) => {
  const skeletons = Array(count).fill(0);

  return (
    <>
      {skeletons.map((_, idx) => (
        <div
          key={idx}
          className={`animate-pulse bg-gray-200 ${circle ? "rounded-full" : "rounded"} ${className}`}
          style={{ width, height }}
        />
      ))}
    </>
  );
};

export default Skeleton;
