import Client from '../models/Client.model.js';
import Commande from '../models/Commande.model.js';
import Product from '../models/product.model.js';
import Confirmer from '../models/Confirmer.model.js';
import Message from '../models/Message.model.js';
import Offer from '../models/Offer.model.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Calcul des dates
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    const sixtyDaysAgo = new Date(now.setDate(now.getDate() - 60));

    // Récupération des données actuelles et précédentes
    const [
      totalClients,
      prevTotalClients,
      totalOrders,
      prevTotalOrders,
      totalProducts,
      prevTotalProducts,
      newClientsLastMonth,
      prevNewClients,
      messageCount,
      prevMessageCount,
      offerCount,
      prevOfferCount

    ] = await Promise.all([
      // Données actuelles
      Client.countDocuments(),
      Client.countDocuments({ createdAt: { $lt: thirtyDaysAgo } }),
      Commande.countDocuments(),
      Commande.countDocuments({ createdAt: { $lt: thirtyDaysAgo } }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, createdAt: { $lt: thirtyDaysAgo } }),
      Client.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Client.countDocuments({
        createdAt: {
          $gte: sixtyDaysAgo,
          $lt: thirtyDaysAgo
        }
      }),
      Message.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Message.countDocuments({
        createdAt: {
          $gte: sixtyDaysAgo,
          $lt: thirtyDaysAgo
        }
      }),
      Offer.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Offer.countDocuments({
        createdAt: {
          $gte: sixtyDaysAgo,
          $lt: thirtyDaysAgo
        }
      })
    ]);

    // Calcul des pourcentages de changement
    const calculateChange = (current, previous) => {
      if (previous === 0) return 100; // Éviter la division par zéro
      return ((current - previous) / previous * 100).toFixed(2);
    };

    const clientsChange = calculateChange(totalClients, prevTotalClients);
    const ordersChange = calculateChange(totalOrders, prevTotalOrders);
    const productsChange = calculateChange(totalProducts, prevTotalProducts);
    const newClientsChange = calculateChange(newClientsLastMonth, prevNewClients);
    const messagesChange = calculateChange(messageCount, prevMessageCount);
    const offersChange = calculateChange(offerCount, prevOfferCount);

    res.json({
      success: true,
      data: {
        totalClients,
        totalOrders,
        totalProducts,
        newClientsLastMonth,
        changes: {
          clients: clientsChange,
          orders: ordersChange,
          products: productsChange,
          newClients: newClientsChange,

          messages: messagesChange,
          offers: offersChange
        },
        messageCount,
        offerCount

      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const getGeographicStats = async (req, res) => {
  try {
      // First get country-level statistics
      const countryStats = await Client.aggregate([
        {
          $group: {
            _id: '$customerCountry',
              totalClients: { $sum: 1 },
              cities: { $addToSet: '$customerCity' },
              clientNames: { $addToSet: '$customerName' }
            }
          },
          {
            $project: {
              country: '$_id',
              totalClients: 1,
              uniqueCitiesCount: { $size: '$cities' },
              uniqueCustomersCount: { $size: '$clientNames' },
              cities: {
                $sortArray: {
                  input: '$cities',
                  sortBy: 1
                }
              },
              _id: 0
            }
          },
          { $sort: { totalClients: -1 } }
        ]);

      // Then get city-level statistics for each country
      const cityStats = await Client.aggregate([
        {
          $group: {
            _id: {
              country: '$customerCountry',
              city: '$customerCity'
            },
            clientCount: { $sum: 1 },
            clientPhones: { $addToSet: '$customerPhone' }
          }
        },
        {
          $project: {
            country: '$_id.country',
            city: '$_id.city',
            clientCount: 1,
            uniqueClientPhones: { $size: '$clientPhones' },
            _id: 0
          }
        },
        { $sort: { country: 1, clientCount: -1 } }
      ]);

      // Get distribution by creation time (month/year)
      const timelineStats = await Client.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            period: {
              $dateToString: {
                format: "%Y-%m",
                date: {
                  $dateFromParts: {
                    year: "$_id.year",
                    month: "$_id.month"
                  }
                }
              }
            },
                count: 1,
              _id: 0
            }
          },
          { $sort: { period: 1 } }
        ]);

      res.json({
        success: true,
        data: {
          summary: {
            totalCountries: countryStats.length,
            totalCities: cityStats.length,
            totalClients: countryStats.reduce((sum, country) => sum + country.totalClients, 0)
          },
          countryStats,
          cityStats,
          timelineStats
        }
      });

    } catch (error) {
      console.error('Error fetching geographic stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch geographic statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
};
// Statistiques des offres
export const getOfferStats = async (req, res) => {
  try {
    const stats = await Offer.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        }
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};