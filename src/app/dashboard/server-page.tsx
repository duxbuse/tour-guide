import { auth0 } from '@/lib/auth0';
import { findOrCreateUser } from '@/lib/db';
import db from '@/lib/db';

interface DashboardData {
  tours: any[];
  allInventoryRecords: any[];
  stats: {
    totalRevenue: number;
    totalSold: number;
    lowStockItems: number;
    upcomingShows: number;
    totalShrinkage: number;
    totalShrinkageValue: number;
  };
}

export default async function ServerDashboard() {
  let dashboardData: DashboardData;

  try {
    const session = await auth0.getSession();

    let auth0User = session?.user;

    // Fallback to manager user for development
    if (!auth0User) {
      auth0User = {
        sub: 'auth0|691f989d2bc713054fec2340',
        email: 'manager@test.com',
        name: 'Tour Manager',
        picture: 'https://github.com/shadcn.png',
        'https://tour-guide.app/roles': ['Manager']
      };
    }

    if (!auth0User) {
      throw new Error('No user found');
    }

    // Get user efficiently
    const user = await findOrCreateUser(auth0User);

    // Single optimized query to get all dashboard data
    const tours = await db.tour.findMany({
      where: { managerId: user.id },
      include: {
        shows: {
          orderBy: { date: 'asc' },
          include: {
            inventoryRecords: {
              include: {
                variant: {
                  include: {
                    merchItem: {
                      select: {
                        id: true,
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        _count: {
          select: { shows: true, merchItems: true }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Transform data
    const allInventoryRecords = tours.flatMap(tour =>
      tour.shows.flatMap(show =>
        show.inventoryRecords.map(record => ({
          ...record,
          show: {
            id: show.id,
            name: show.name,
            date: show.date,
            venue: show.venue
          }
        }))
      )
    );

    // Calculate stats on server
    const stats = calculateStats(tours, allInventoryRecords);

    dashboardData = {
      tours: tours.map(tour => ({
        id: tour.id,
        name: tour.name,
        isActive: tour.isActive,
        startDate: tour.startDate,
        endDate: tour.endDate,
        shows: tour.shows.map(show => ({
          id: show.id,
          name: show.name,
          date: show.date,
          venue: show.venue
        })),
        _count: tour._count
      })),
      allInventoryRecords,
      stats
    };

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return empty state if error
    dashboardData = {
      tours: [],
      allInventoryRecords: [],
      stats: {
        totalRevenue: 0,
        totalSold: 0,
        lowStockItems: 0,
        upcomingShows: 0,
        totalShrinkage: 0,
        totalShrinkageValue: 0
      }
    };
  }

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Dashboard</h1>
          <p>Overview across all tours.</p>
        </div>
      </header>

      <div className="stat-grid">
        <StatCard
          label="Total Revenue"
          value={`$${dashboardData.stats.totalRevenue.toFixed(2)}`}
          desc={dashboardData.stats.totalRevenue > 0 ? 'From inventory sales' : 'Ready to start'}
          positive={dashboardData.stats.totalRevenue > 0}
        />
        <StatCard
          label="Items Sold"
          value={dashboardData.stats.totalSold.toString()}
          desc={dashboardData.stats.totalSold > 0 ? 'Total across all shows' : 'Ready to start'}
          positive={dashboardData.stats.totalSold > 0}
        />
        <StatCard
          label="Low Stock Items"
          value={dashboardData.stats.lowStockItems.toString()}
          desc={dashboardData.stats.lowStockItems === 0 ? 'All good' : 'Need restocking'}
          positive={dashboardData.stats.lowStockItems === 0}
        />
        <StatCard
          label="Upcoming Shows"
          value={dashboardData.stats.upcomingShows.toString()}
          desc={dashboardData.stats.upcomingShows === 0 ? 'Plan your tour' : 'Across all tours'}
        />
        <StatCard
          label="Shrinkage Loss"
          value={dashboardData.stats.totalShrinkage.toString()}
          desc={dashboardData.stats.totalShrinkage > 0 ? `Lost items ($${dashboardData.stats.totalShrinkageValue.toFixed(2)})` : 'No losses'}
          positive={dashboardData.stats.totalShrinkage === 0}
        />
        <StatCard
          label="Active Tours"
          value={dashboardData.tours.filter(t => t.isActive).length.toString()}
          desc={`Total tours: ${dashboardData.tours.length}`}
        />
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Recent Activity</h3>
        {dashboardData.allInventoryRecords.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {dashboardData.allInventoryRecords
              .slice(0, 5)
              .map((record, index) => (
                <div key={index} style={{
                  padding: '1rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {record.variant.merchItem.name} - {record.variant.type ? `${record.variant.type} ` : ''}{record.variant.size}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {record.show.name}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
                        {record.soldCount || 0} sold
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        ${((record.soldCount || 0) * record.variant.price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No activity yet</h3>
            <p>Sales and updates will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, desc, positive }: {
  label: string;
  value: string;
  desc: string;
  positive?: boolean;
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div style={{ 
        color: positive === true ? '#10B981' : positive === false ? '#EF4444' : 'var(--text-secondary)', 
        fontSize: '0.875rem' 
      }}>
        {desc}
      </div>
    </div>
  );
}

function calculateStats(tours: any[], allInventoryRecords: any[]) {
  const totalSold = allInventoryRecords.reduce((sum, record) =>
    sum + (record.soldCount || 0), 0
  );
  
  const totalRevenue = allInventoryRecords.reduce((sum, record) =>
    sum + ((record.soldCount || 0) * record.variant.price), 0
  );

  const lowStockItems = allInventoryRecords.filter(record => 
    record.variant.quantity < 5
  ).length;

  const upcomingShows = tours.reduce((total, tour) => {
    return total + tour.shows.filter((show: any) =>
      new Date(show.date) > new Date()
    ).length;
  }, 0);

  const shrinkage = calculateTotalShrinkage(allInventoryRecords);

  return {
    totalSold,
    totalRevenue,
    lowStockItems,
    upcomingShows,
    totalShrinkage: shrinkage.totalItems,
    totalShrinkageValue: shrinkage.totalValue
  };
}

function calculateTotalShrinkage(allInventoryRecords: any[]) {
  const shrinkageData: Array<{ shrinkage: number; value: number }> = [];

  // Group records by variant
  const recordsByVariant = allInventoryRecords.reduce((acc, record) => {
    const key = record.variantId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(record);
    return acc;
  }, {} as Record<string, any[]>);

  (Object.values(recordsByVariant) as any[][]).forEach((variantRecords) => {
    const sortedRecords = variantRecords.sort((a: any, b: any) =>
      new Date(a.show.date).getTime() - new Date(b.show.date).getTime()
    );

    for (let i = 1; i < sortedRecords.length; i++) {
      const prevRecord = sortedRecords[i - 1];
      const currentRecord = sortedRecords[i];

      if (prevRecord.endCount !== null && currentRecord.startCount !== null) {
        const shrinkage = prevRecord.endCount - currentRecord.startCount;
        if (shrinkage > 0) {
          shrinkageData.push({
            shrinkage: shrinkage,
            value: shrinkage * currentRecord.variant.price
          });
        }
      }
    }
  });

  return {
    totalItems: shrinkageData.reduce((sum, item) => sum + item.shrinkage, 0),
    totalValue: shrinkageData.reduce((sum, item) => sum + item.value, 0)
  };
}