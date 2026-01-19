type SkeletonProps = {
  height?: number | string
  width?: number | string
  rounded?: number
  className?: string
}

export default function Skeleton({
  height = 20,
  width = "100%",
  rounded = 8,
  className = "",
}: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        height,
        width,
        borderRadius: rounded,
        background: "linear-gradient(90deg, #e5e7eb, #f3f4f6, #e5e7eb)",
        backgroundSize: "200% 100%",
        animation: "skeleton-loading 1.4s ease infinite",
      }}
    >
      <style>
        {`
          @keyframes skeleton-loading {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}
      </style>
    </div>
  )
}
