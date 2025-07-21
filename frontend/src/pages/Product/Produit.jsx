import "../../ProduitS.css";
import { FaPlus, FaStar, FaFilter } from "react-icons/fa6";
import { Link } from "react-router-dom";
import axios from 'axios';
import { useState, useEffect } from 'react';
import { FaRegStar } from "react-icons/fa";

export default function Produit() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeStatusLoading, setActiveStatusLoading] = useState({});

  // États pour les filtres
  const [filters, setFilters] = useState({
    status: 'all', // 'all', 'active', 'inactive'
    category: 'all',
    priceRange: 'all', // 'all', '0-100', '100-500', '500+'
    sortBy: 'none' // 'none', 'price-asc', 'price-desc', 'name-asc', 'name-desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data.products || []);
      setFilteredProducts(response.data.products || []);
      setError('');

      // Extraire les catégories uniques
      const uniqueCategories = [...new Set(response.data.products.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Erreur lors du chargement des produits:', err);
      setError('Impossible de charger les produits. Veuillez réessayer plus tard.');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [filters, products]);

  const applyFilters = () => {
    let result = [...products];

    // Filtre par statut
    if (filters.status !== 'all') {
      result = result.filter(product =>
        filters.status === 'active' ? product.isFeatured : !product.isFeatured
      );
    }

    // Filtre par catégorie
    if (filters.category !== 'all') {
      result = result.filter(product => product.category === filters.category);
    }

    // Filtre par prix
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      if (max) {
        result = result.filter(product => product.price >= min && product.price <= max);
      } else {
        result = result.filter(product => product.price >= min);
      }
    }

    // Tri
    if (filters.sortBy !== 'none') {
      const [field, order] = filters.sortBy.split('-');
      result.sort((a, b) => {
        if (field === 'price') {
          return order === 'asc' ? a.price - b.price : b.price - a.price;
        } else {
          return order === 'asc'
            ? a[field].localeCompare(b[field])
            : b[field].localeCompare(a[field]);
        }
      });
    }

    setFilteredProducts(result);
  };

  const toggleActiveStatus = async (productId, currentStatus) => {
    setActiveStatusLoading(prev => ({ ...prev, [productId]: true }));

    try {
      const response = await axios.patch(
        `http://localhost:5000/api/products/${productId}/toggle-active`
      );
      console.log('Statut modifié:', response.data);

      setProducts(prevProducts =>
        prevProducts.map(product =>
          product._id === productId
            ? { ...product, isFeatured: !currentStatus }
            : product
        )
      );
    } catch (err) {
      console.error('Erreur lors de la modification du statut:', err);
      setError('Erreur lors de la modification du statut');
    } finally {
      setActiveStatusLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      category: 'all',
      priceRange: 'all',
      sortBy: 'none'
    });
  };

  const LoadingSpinner = () => (
    <div className="text-center my-12">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#64FF07]"></div>
      <p className="mt-4 text-black dark:text-gray-100">Chargement des produits...</p>
    </div>
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;
  if (products.length === 0) return <div className="no-products">Aucun produit disponible</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-black p-6 border-[#64FF07] border-2 rounded-lg shadow-lg">
        <h2 className="special-font text-5xl text-center mb-6 text-black dark:text-gray-100">
          <b>Predefined produits</b>
        </h2>

        {/* Bouton pour afficher/masquer les filtres */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-[#64FF07] text-black rounded hover:bg-[#53e000]"
          >
            <FaFilter /> {showFilters ? 'Masquer les filtres' : 'Filtrer les produits'}
          </button>

          <div className="text-black dark:text-gray-100">
            {filteredProducts.length} produit(s) trouvé(s)
          </div>
        </div>

        {/* Panneau de filtres */}
        {showFilters && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtre par statut */}
              <div>
                <label className="block text-sm font-medium text-black dark:text-gray-100 mb-1">
                  Statut
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </select>
              </div>

              {/* Filtre par catégorie */}
              <div>
                <label className="block text-sm font-medium text-black dark:text-gray-100 mb-1">
                  Catégorie
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Filtre par prix */}
              <div>
                <label className="block text-sm font-medium text-black dark:text-gray-100 mb-1">
                  Prix
                </label>
                <select
                  name="priceRange"
                  value={filters.priceRange}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Toutes les gammes de prix</option>
                  <option value="0-100">0 - 100 MAD</option>
                  <option value="100-200">100 - 200 MAD</option>
                  <option value="200-300">200 - 300 MAD</option>
                  <option value="300-400">300 - 400 MAD</option>
                  <option value="400-500">400 - 500 MAD</option>
                  <option value="500+">500+ MAD</option>
                </select>
              </div>

              {/* Tri */}
              <div>
                <label className="block text-sm font-medium text-black dark:text-gray-100 mb-1">
                  Trier par
                </label>
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
                >
                  <option value="none">Aucun tri</option>
                  <option value="price-asc">Prix (croissant)</option>
                  <option value="price-desc">Prix (décroissant)</option>
                  <option value="name-asc">Nom (A-Z)</option>
                  <option value="name-desc">Nom (Z-A)</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        )}

        {/* Liste des produits filtrés */}
        <div className="list">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product._id} className={`card-new-seller-prioritize ${!product.isFeatured ? 'inactive' : ''}`}>
                <div className="basicInfo">
                  <div className="title">
                    <div className="name">{product.SKU}</div>
                  </div>
                  <div className="images">
                    <div className="img">
                      <div className="item">
                        <img
                          src={product.imageProduct}
                          alt={product.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150?text=Image+Indisponible';
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="addCard">
                    <Link to={`/produitDetail/${product.SKU}`} aria-label={`Voir les détails de ${product.name}`}>
                      <i className="fa fa-cart-plus">
                        <FaPlus />
                      </i>
                    </Link>
                  </div>
                </div>
                <div className="mores">
                  <div
                    className="stars flex cursor-pointer "
                    onClick={() => toggleActiveStatus(product._id, product.isFeatured)}
                    title={product.isFeatured ? "Désactiver le produit" : "Activer le produit"}
                    aria-label={product.isFeatured ? "Désactiver le produit" : "Activer le produit"}
                  >
                    {[...Array(1)].map((_, i) => (
                      activeStatusLoading[product._id] ? (
                        <span key={i} className="loading-dot" style={{ animationDelay: `${i * 0.1}s` }}></span>
                      ) : product.isFeatured ? (
                        <FaStar key={i} className="text-yellow-500 text-xl" />
                      ) : (
                        <FaRegStar key={i} className="text-gray-400 text-xl" />
                      )
                    ))}
                  </div>
                  <div className="price">
                    {product.price?.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'MAD',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-black dark:text-gray-100">
              Aucun produit ne correspond à vos critères de filtrage.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}