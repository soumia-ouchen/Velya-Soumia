import Badge from "./Badge";
import { useState, useEffect } from 'react';

export default function EcommerceMetrics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/stats/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        const data = await response.json();
        setStats(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) return <div className="text-center my-12">
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#64FF07]"></div>
    <p className="mt-4 text-black dark:text-gray-100">Chargement des produits...</p>
  </div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!stats) return <div className="text-center py-8">No data available</div>;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      <MetricCard
        title="Customers"
        value={stats.totalClients}
        icon="/icons/Customers.svg"
        change={stats.changes.clients}
        trend={stats.changes.clients >= 0 ? 'up' : 'down'}
      />
      <MetricCard
        title="Orders"
        value={stats.totalOrders}
        icon="/icons/message-send.svg"
        change={stats.changes.orders}
        trend={stats.changes.orders >= 0 ? 'up' : 'down'}

      />
      <MetricCard
        title="products"
        value={stats.totalProducts}
        icon="/icons/box.svg"
        change={stats.changes.products}
        trend={stats.changes.products >= 0 ? 'up' : 'down'}
      />
      <MetricCard
        title="New Users"
        value={stats.newClientsLastMonth}
        icon="/icons/Customers.svg"
        change={stats.changes.newClients}
        trend={stats.changes.newClients >= 0 ? 'up' : 'down'}
      />
      <MetricCard
        title="Messages"
        value={stats.messageCount}
        icon="/icons/message-send.svg"
        change={stats.changes.messages}
        trend={stats.changes.messages >= 0 ? 'up' : 'down'}
      />
      <MetricCard
        title="Offers"
        value={stats.offerCount}
        icon="/icons/box.svg"
        change={stats.changes.offers}
        trend={stats.changes.offers >= 0 ? 'up' : 'down'}
      />
    </div>
  );
}

function MetricCard({ title, value, icon, change, trend }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        <img
          src={icon}
          alt={title}
          className="w-6 h-6 text-gray-800 dark:text-white/90"
        />
      </div>

      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {value}
          </h4>
        </div>
        <Badge color={trend === 'up' ? 'success' : 'error'}>
          <img
            src={`/icons/${trend === 'up' ? 'Up' : 'Down'}.svg`}
            alt={`Arrow ${trend}`}
            className="w-4 h-4 "
          />
              <span className="text-sm text-gray-500 dark:text-gray-400">
            {change}%
          </span>

        </Badge>
      </div>
    </div>
  );
}