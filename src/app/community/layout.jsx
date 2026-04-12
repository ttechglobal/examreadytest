export default function CommunityLayout({ children }) {
  return (
    <div
      className="student-page font-nunito"
      style={{ fontFamily: "var(--font-nunito, 'Nunito', sans-serif)" }}
    >
      {children}
    </div>
  )
}
