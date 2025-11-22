import { NavBar } from '@/components/NavBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-main">
        <NavBar />
        <main style={{ padding: 'var(--spacing-md)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
