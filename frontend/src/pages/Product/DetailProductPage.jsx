import { useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from "../../components/common/Button";
import { FaStar } from "react-icons/fa6";
import { FaRegStar } from "react-icons/fa";



import { useNavigate } from "react-router-dom";

export default function Detail() {
  const { SKU } = useParams(); // On utilise maintenant SKU comme identifiant
  const [product, setProduct] =  useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/sku/${SKU}`);
        setProduct(response.data);
      } catch (err) {
        setError('Erreur lors du chargement du produit');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [SKU]);

  if (loading) {
    return <div className="loading">Chargement du produit...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!product) {
    return <div>Produit non trouvé.</div>;
  }

    const handleDelete = async () => {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
        try {
          await axios.delete(`http://localhost:5000/api/products/${SKU}`);
          navigate('/produit');
        } catch (err) {
          console.error('Erreur lors de la suppression du produit:', err);
          setError('Erreur lors de la suppression du produit');
        }
      }
    };
  return (
    <div className="detail-page">
      <h2>{product.name}</h2>
      <div className="detail-content">
        <div className="image-container">
          <img 
            src={product.imageProduct} 
            alt={product.name} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300?text=Image+non+disponible';
            }}
          />

          {/* button update */  }
               <Button
                        type="button"
                        title="Modifier"
                        onClick={() => navigate(`/produit/${product.SKU}`)}
                        containerClass="flex-center gap-2"
                        className="text-black bg-gray-200 hover:bg-gray-300"
            />
                   <Button
                          type="button"
                          title="Cancel"
                          onClick={() => navigate(-1)}
                          containerClass="flex-center gap-2"
                          className="text-black bg-gray-200 hover:bg-gray-300"
                        />
          {/* button delete */}
          <Button
            onClick={handleDelete}
            type="button"
            title="Supprimer"
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          />

       
      

    
        </div>
        <div className="detail-info">
          {product.isFeatured ? (
            <div className="flex items-center space-x-2">
              <FaStar className="text-yellow-500 text-xl" />
              <span className="text-sm text-yellow-600 font-medium">Produit en vedette</span>
              <br /> <br />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <FaRegStar className="text-gray-400 text-xl" />
              <span className="text-sm text-gray-500">Produit standard</span>
              <br /> <br />
            </div>
          )}

          <p><strong>Prix  :</strong> ${product.price.toFixed(2)}</p>
          <p><strong>SKU :</strong> {product.SKU}</p>
          <p><strong>Catégorie :</strong> {product.category}</p>
          <p><strong>Couleur :</strong> {product.color}</p>
          <p><strong>Taille :</strong> {product.size}</p>
          <p><strong>Marque :</strong> {product.brand}</p>
          <p><strong >Description :</strong> {product.description}</p>



          <p><strong >image Description :</strong>       {product.imageDescription && (
            <img 
              src={product.imageDescription} 
              alt={`Détail ${product.name}`}
              className="secondary-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300?text=Image+secondaire+non+disponible';
              }}
            />
          )}</p>

        </div>
      </div>
    </div>
  );
}