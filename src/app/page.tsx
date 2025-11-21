import Link from "next/link";

export default function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
      background: 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.1), transparent 40%)'
    }}>
      <h1 style={{
        fontSize: '4rem',
        fontWeight: '700',
        marginBottom: '1.5rem',
        letterSpacing: '-0.03em',
        lineHeight: '1.2',
        background: 'linear-gradient(135deg, #ffffff 0%, #a5a5a5 50%, var(--accent-primary) 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 0 30px var(--glow-purple)'
      }}>
        Tour Guide
      </h1>

      <p style={{
        fontSize: '1.5rem',
        color: 'var(--text-secondary)',
        maxWidth: '600px',
        marginBottom: '3rem',
        lineHeight: '1.5'
      }}>
        The ultimate tool for band tour managers. Track merchandise, manage inventory, and monitor sales across every show.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/auth/login"
          className="btn btn-primary animate-pulse-glow"
          style={{
            textDecoration: 'none'
          }}
        >
          Get Started
        </a>
        <Link
          href="/dashboard"
          className="btn btn-secondary"
          style={{
            textDecoration: 'none'
          }}
        >
          View Demo
        </Link>
      </div>

      <div style={{
        marginTop: '5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'var(--spacing-md)',
        width: '100%',
        maxWidth: '1200px'
      }}>
        <FeatureCard
          title="Tour Management"
          description="Organize multiple tours, manage dates, and keep track of venues all in one place."
        />
        <FeatureCard
          title="Merch Tracking"
          description="Real-time inventory tracking for all your merchandise items, variants, and sizes."
        />
        <FeatureCard
          title="Sales Analytics"
          description="Detailed insights into sales performance per show, per item, and per head."
        />
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="card animate-fade-in delay-200">
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        color: 'var(--text-accent)',
        textShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
      }}>
        {title}
      </h3>
      <p style={{
        color: 'var(--text-secondary)',
        lineHeight: '1.6'
      }}>
        {description}
      </p>
    </div>
  );
}
