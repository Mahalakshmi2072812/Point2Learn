export default function Logo({ size = 'xl' }) {
  const heights = { xl: 200, lg: 160, md: 130, sm: 100 }
  const h = heights[size] || 100
  return (
    <img
      src="/logo.png"
      alt="Point2Learn"
      style={{
        height: h,
        width: 'auto',
        objectFit: 'contain',
        display: 'block'
      }}
    />
  )
}
