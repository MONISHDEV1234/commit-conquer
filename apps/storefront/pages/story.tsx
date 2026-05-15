import { Link } from "react-router-dom";

export default function StoryPage() {
  return (
    <div style={s.page}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        .au-card { animation: fadeUp 0.5s ease both; }
        .au-card:nth-child(2) { animation-delay: 0.1s; }
        .au-card:nth-child(3) { animation-delay: 0.2s; }
      `}</style>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.eyebrow}>Our Story</div>
        <h1 style={s.heroTitle}>From a single idea<br />to a global movement.</h1>
        <p style={s.heroSub}>
          We started in a garage with nothing but a sewing machine and a vision.
          Our goal was never just to make clothes—it was to build a community
          of individuals who appreciate true craftsmanship and timeless design.
        </p>
      </section>

      {/* Values */}
      <div style={s.cards}>
        {[
          { icon: "✦", title: "The Beginning", body: "It all started with a simple sketch and a desire to challenge the fast-fashion industry's lack of durability." },
          { icon: "✧", title: "The Journey", body: "Years of iterating, testing, and refining our materials led us to the perfect blend of comfort and longevity." },
          { icon: "★", title: "The Future", body: "We're continually pushing the boundaries of what sustainable, high-quality streetwear can look like." },
        ].map((c) => (
          <div key={c.title} className="au-card" style={s.card}>
            <div style={s.cardIcon}>{c.icon}</div>
            <h3 style={s.cardTitle}>{c.title}</h3>
            <p style={s.cardBody}>{c.body}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 60 }}>
        <Link to="/" style={s.cta}>Shop the Collection →</Link>
      </div>
    </div>
  );
}

const s: Record<string, any> = {
  page:       { maxWidth: 900, margin: "0 auto", padding: "60px 24px 100px" },
  hero:       { textAlign: "center", marginBottom: 80 },
  eyebrow:    { fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#7c6aff", textTransform: "uppercase", marginBottom: 20 },
  heroTitle:  { fontSize: "clamp(36px,6vw,64px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 24 },
  heroSub:    { fontSize: 18, color: "#aaa", lineHeight: 1.8, maxWidth: 600, margin: "0 auto" },
  cards:      { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 24, marginBottom: 80 },
  card:       { background: "#141417", border: "1px solid #2a2a31", borderRadius: 16, padding: 32 },
  cardIcon:   { fontSize: 28, marginBottom: 16, color: "#7c6aff" },
  cardTitle:  { fontSize: 18, fontWeight: 700, marginBottom: 10 },
  cardBody:   { color: "#aaa", lineHeight: 1.7, fontSize: 15 },
  cta:        { display: "inline-block", padding: "16px 40px", background: "#7c6aff", color: "#fff", textDecoration: "none", borderRadius: 12, fontWeight: 700, fontSize: 16 },
};
