import Link from "next/link";

export default function Home() {
  return (
    <div className="home-container">
      <main className="home-main">
        <h1 className="home-title">
          Tour Guide
        </h1>

        <p className="home-subtitle">
          The ultimate tool for band tour managers. Track merchandise, manage inventory, and monitor sales across every show.
        </p>

        <div className="home-actions">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/auth/login"
            className="btn btn-primary"
          >
            Get Started
          </a>
          <Link
            href="/dashboard"
            className="btn btn-secondary"
          >
            View Demo
          </Link>
        </div>

        <div className="features-grid">
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
      </main>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="feature-card">
      <h3 className="feature-title">
        {title}
      </h3>
      <p className="feature-description">
        {description}
      </p>
    </div>
  );
}
