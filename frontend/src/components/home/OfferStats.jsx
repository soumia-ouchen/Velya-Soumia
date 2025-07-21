import { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from "react-apexcharts";
import { Dropdown } from "./Dropdown";
import { DropdownItem } from "./DropdownItem";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const OfferStats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/stats/offers');
        const formattedStats = response.data.data.map(stat => ({
          ...stat,
          monthYear: `${monthNames[stat._id.month - 1]} ${stat._id.year}`
        }));
        setStats(formattedStats);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  function closeDropdown() {
    setIsOpen(false);
  }

  // Prepare chart data
  const chartOptions = {
    colors: ["#64FF07"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "line",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    markers: {
      size: 5,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: stats.map(stat => stat.monthYear),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: '#64748B',
          fontSize: '12px',
          fontFamily: 'Outfit, sans-serif',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748B',
          fontSize: '12px',
          fontFamily: 'Outfit, sans-serif',
        },
      },
    },
    grid: {
      borderColor: '#F1F5F9',
      strokeDashArray: 5,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val) => `${val} offers`,
      },
      style: {
        fontFamily: 'Outfit, sans-serif',
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontFamily: 'Outfit, sans-serif',
      markers: {
        radius: 12,
      },
    },
  };

  const chartSeries = [
    {
      name: "Offers Created",
      data: stats.map(stat => stat.count),
    },
  ];

  if (loading) return <div className="p-5 text-gray-500">Loading offer statistics...</div>;
  if (error) return <div className="p-5 text-red-500">Error: {error}</div>;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Offer Creation Trends
        </h3>
        <div className="relative inline-block">
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Export Data
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart 
            options={chartOptions} 
            series={chartSeries} 
            type="line" 
            height={180} 
          />
        </div>
      </div>

      <div className="mt-6 mb-4">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          Monthly Statistics
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Offers Count
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {stats.map((stat, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {monthNames[stat._id.month - 1]}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {stat._id.year}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                    {stat.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OfferStats;