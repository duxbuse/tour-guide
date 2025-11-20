import Link from "next/link";

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <nav className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 2rem' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-accent)' }}>
          Tour<span style={{ color: 'var(--accent-primary)' }}>Guide</span>
        </div>
        <div>
          <Link href="/api/auth/login" className="btn btn-secondary" style={{ fontSize: '0.9rem', padding: '0.5rem 1.2rem' }}>
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '4rem 2rem' }}>
        <div className="animate-fade-in">
          <h1 style={{ maxWidth: '800px', margin: '0 auto 1.5rem' }}>
            Master Your Merch <br /> On The Road
          </h1>
          <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2.5rem', color: 'var(--text-secondary)' }}>
            The ultimate tool for bands and tour managers to track sales, inventory, and revenue across every gig.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/dashboard" className="btn btn-primary">
              Get Started
            </Link>
            <Link href="#features" className="btn btn-secondary">
              Learn More
            </Link>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" style={{ background: 'var(--bg-secondary)', padding: '6rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '4rem' }}>Everything You Need</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

            {/* Feature 1 */}
            <div className="card animate-fade-in delay-100">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Tour Management</h3>
              <p>Organize your dates, venues, and logistics in one place. Keep the whole crew in sync.</p>
            </div>

            {/* Feature 2 */}
            <div className="card animate-fade-in delay-200">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Real-time Inventory</h3>
              <p>Track stock levels across all items. Know exactly what to restock and when.</p>
            </div>

            {/* Feature 3 */}
            <div className="card animate-fade-in delay-300">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Analytics & Exports</h3>
              <p>Visualize sales data and export reports for management and labels instantly.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div className="container">
          <p>&copy; 2024 TourGuide. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

