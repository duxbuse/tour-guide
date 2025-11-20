import Link from "next/link";

export default function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '2rem',
      textAlign: 'center',
      background: 'linear-gradient(to bottom, #ffffff, #f3f4f6)'
    }}>
      <h1 style={{
        fontSize: '4rem',
        fontWeight: '800',
        marginBottom: '1.5rem',
        letterSpacing: '-0.025em',
        lineHeight: '1.1'
      }}>
        Tour Guide
      </h1>

      <p style={{
        fontSize: '1.5rem',
        color: '#4b5563',
        maxWidth: '600px',
        marginBottom: '3rem',
        lineHeight: '1.5'
      }}>
        The ultimate tool for band tour managers. Track merchandise, manage inventory, and monitor sales across every show.
      </p>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <a
          href="/api/auth/login"
          style={{
            padding: '1rem 2rem',
            backgroundColor: 'black',
            color: 'white',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1.125rem',
            transition: 'opacity 0.2s'
          }}
        >
          Get Started
        </a>
        <Link
          href="/about"
          style={{
            padding: '1rem 2rem',
            backgroundColor: 'white',
            color: 'black',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1.125rem'
          }}
        >
          Learn More
        </Link>
      </div>

      <div style={{
        marginTop: '5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
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
    <div style={{
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      textAlign: 'left'
    }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{title}</h3>
      <p style={{ color: '#6b7280', lineHeight: '1.6' }}>{description}</p>
    </div>
  );
}
