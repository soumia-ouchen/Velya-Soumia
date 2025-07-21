import { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from "react-apexcharts";
import Button from "../common/Button";

export default GeographicStatsChart; function GeographicStatsChart() {
  const [stats, setStats] = useState({
    summary: {},
    countryStats: [],
    cityStats: [],
    timelineStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/stats/geographic');
        setStats(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Filtrer les statistiques des villes par pays sélectionné
  const filteredCityStats = selectedCountry
    ? stats.cityStats.filter(city => city.country === selectedCountry)
    : [];

  // Options du graphique pour les données par pays
  const countryChartOptions = {
    colors: ["#64FF07"],

    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 180,
      type: "bar",
      toolbar: {
        show: false,
      },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const country = stats.countryStats[config.dataPointIndex].country;
          setSelectedCountry(country);
        }
      }
    },
    plotOptions: {
      horizontal: false,
      columnWidth: "30%",
      borderRadius: 5,
      borderRadiusApplication: "end",
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 5,
      colors: ["transparent"],
    },
    xaxis: {
      categories: stats.countryStats?.map(stat => stat.country) || [],
    },
    yaxis: {
      title: {
        text: "Nombre de clients"
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " clients";
        }
      }
    }
  };

  // Options du graphique pour les données par ville
  const cityChartOptions = {
    colors: ["#64FF07"],

    ...countryChartOptions,
    xaxis: {
      categories: filteredCityStats?.map(stat => stat.city) || [],
    },
    chart: {
      ...countryChartOptions.chart,
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const city = filteredCityStats[config.dataPointIndex].city;
          setSelectedCountry(city);
        }
      }
    }
  };



  const countrySeries = [
    {
      name: "Clients",
      data: stats.countryStats?.map(stat => stat.totalClients) || []
    }
  ];

  const citySeries = [
    {
      name: "Clients",
      data: filteredCityStats?.map(stat => stat.clientCount) || []
    }
  ];

  const handleBackToCountries = () => {
    setSelectedCountry(null);
  };

  if (loading) return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg">
        Erreur lors du chargement des statistiques géographiques: {error}
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {selectedCountry ? `Villes en ${selectedCountry}` : 'Répartition géographique'}
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            {selectedCountry
              ? `Répartition des clients par ville en ${selectedCountry}`
              : 'Répartition des clients par pays'}
          </p>
        </div>
        {selectedCountry && (
          <Button
            onClick={handleBackToCountries}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Retour aux pays
          </Button>
        )}
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          {selectedCountry ? (
            <Chart
              options={cityChartOptions}
              series={citySeries}
              type="bar" height={360}
            />
          ) : (
            <Chart
              options={countryChartOptions}
              series={countrySeries}
                type="bar" height={200}
            />
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          {selectedCountry ? 'Statistiques par ville' : 'Statistiques par pays'}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {selectedCountry ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ville</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Clients</th>
                  </>
                ) : (
                  <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pays</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Clients</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Villes</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {selectedCountry ? (
                filteredCityStats?.map((stat, index) => (
                  <tr key={`city-${index}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{stat.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{stat.clientCount}</td>
                  </tr>
                ))
              ) : (
                stats.countryStats?.map((stat, index) => (
                  <tr
                    key={`country-${index}`}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => setSelectedCountry(stat.country)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{stat.country}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{stat.totalClients}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{stat.uniqueCitiesCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}