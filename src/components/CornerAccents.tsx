/** Reusable component for bottom-left and bottom-right corner accents */
export function CornerAccents() {
  return (
    <>
      {/* Bottom-left corner accent */}
      <div
        className="absolute bottom-0 left-0 rounded-xl"
        style={{
          width: '20px',
          height: '2px',
          backgroundColor: 'var(--brand-accent-dark)',
        }}
      />
      <div
        className="absolute bottom-0 left-0"
        style={{
          width: '2px',
          height: '20px',
          backgroundColor: 'var(--brand-accent-dark)',
        }}
      />
      {/* Bottom-right corner accent */}
      <div
        className="absolute bottom-0 right-0"
        style={{
          width: '20px',
          height: '2px',
          backgroundColor: 'var(--brand-accent-dark)',
        }}
      />
      <div
        className="absolute bottom-0 right-0"
        style={{
          width: '2px',
          height: '20px',
          backgroundColor: 'var(--brand-accent-dark)',
        }}
      />
    </>
  )
}
