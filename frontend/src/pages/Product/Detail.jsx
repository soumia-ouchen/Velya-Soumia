import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Alert, Row, Col } from 'react-bootstrap';
import Button from "../../components/common/Button";
import { FaSave, FaTimes } from "react-icons/fa";

const PRODUCT_CONFIG = {
  categories: ["vêtements", "chaussures", "accessoires", "électronique", "maison", "beauté"],
  colors: ["noir", "blanc", "rouge", "bleu", "vert", "jaune", "gris", "rose"],
  sizeMap: {
    vêtements: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
    chaussures: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
    accessoires: ["TU", "ONE SIZE"],
    default: ["UNIQUE"]
  }
};

export default function Detail() {
  const { SKU } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [previewImageDes, setPreviewImageDes] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/sku/${SKU}`);
        setProduct(response.data);
        // Pré-remplir les prévisualisations d'images
        if (response.data.imageProduct) setPreviewImage(response.data.imageProduct);
        if (response.data.imageDescription) setPreviewImageDes(response.data.imageDescription);
      } catch (err) {
        console.error('Erreur lors du chargement du produit:', err);
        setError('Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [SKU]);

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

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!product.name.trim()) {
      errors.name = 'Le nom du produit est requis';
      isValid = false;
    }

    if (!product.description.trim()) {
      errors.description = 'La description est requise';
      isValid = false;
    }

    if (product.price <= 0) {
      errors.price = 'Le prix doit être supérieur à 0';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);

    setProduct(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleImageChangeDes = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreviewImageDes(reader.result);
    reader.readAsDataURL(file);

    setProduct(prev => ({
      ...prev,
      imageDes: file
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('SKU', product.SKU);
      formData.append('name', product.name);
      formData.append('description', product.description);
      formData.append('price', parseFloat(product.price));
      formData.append('category', product.category);
      formData.append('color', product.color);
      formData.append('size', product.size);
      formData.append('brand', product.brand);
      formData.append('isFeatured', product.isFeatured);

      // Ajouter les images seulement si elles ont été modifiées
      if (product.image) formData.append('imageProduct', product.image);
      if (product.imageDes) formData.append('imageDescription', product.imageDes);

      const response = await axios.put(
        `http://localhost:5000/api/products/${SKU}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setProduct(response.data);
      setSuccess('Produit mis à jour avec succès!');
      if (response.data.imageProduct) setPreviewImage(response.data.imageProduct);
      if (response.data.imageDescription) setPreviewImageDes(response.data.imageDescription);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const sizeOptions = PRODUCT_CONFIG.sizeMap[product?.category] || PRODUCT_CONFIG.sizeMap.default;

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;
  if (!product) return <div>Produit non trouvé</div>;

  return (
    <Container className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-black p-6 border-[#64FF07] border-2 rounded-lg shadow-lg">
        <div className="flex justify-between mb-6">
          <h2 className="special-font text-5xl text-black dark:text-gray-100">
            <b>Modifier le Produit</b>
          </h2>
          <Button
            onClick={handleDelete}
            type="button"
            title="Supprimer"
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          />
          <Button
            type="button"
            title="Cancel"
            onClick={() => navigate(-1)}
            containerClass="flex-center gap-2"
            className="text-black bg-gray-200 hover:bg-gray-300"
          />
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="block text-sm text-black dark:text-gray-100 mb-2">SKU*</Form.Label>
                <Form.Control
                  type="text"
                  name="SKU"
                  value={product.SKU || ''}
                  onChange={handleChange}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-black dark:text-gray-100"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="block text-sm text-black dark:text-gray-100 mb-2">Nom du Produit*</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={product.name || ''}
                  onChange={handleChange}
                  isInvalid={!!formErrors.name}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="block text-sm text-black dark:text-gray-100 mb-2">Description*</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="description"
              value={product.description || ''}
              onChange={handleChange}
              isInvalid={!!formErrors.description}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.description}
            </Form.Control.Feedback>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="block text-sm text-black dark:text-gray-100 mb-2">Image Principale</Form.Label>
                <Form.Control
                  type="file"
                  name="image"
                  accept="image/jpeg, image/png, image/gif"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-black hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-100 dark:hover:file:bg-gray-600"
                />
                {previewImage && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <img
                      src={previewImage}
                      alt="Aperçu image principale"
                      className="max-h-64 rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                  </div>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="block text-sm text-black dark:text-gray-100 mb-2">Image Secondaire</Form.Label>
                <Form.Control
                  type="file"
                  name="imageDes"
                  accept="image/jpeg, image/png, image/gif"
                  onChange={handleImageChangeDes}
                  className="block w-full text-sm text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-black hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-100 dark:hover:file:bg-gray-600"
                />
                {previewImageDes && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <img
                      src={previewImageDes}
                      alt="Aperçu image secondaire"
                      className="max-h-64 rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="block text-sm text-black dark:text-gray-100 mb-2">Prix (€)*</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={product.price || ''}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  isInvalid={!!formErrors.price}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.price}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="block text-sm text-black dark:text-gray-100 mb-2">Catégorie*</Form.Label>
                <Form.Select
                  name="category"
                  value={product.category || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
                >
                  {PRODUCT_CONFIG.categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="block text-sm text-black dark:text-gray-100 mb-2">Taille</Form.Label>
                <Form.Select
                  name="size"
                  value={product.size || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
                >
                  <option value="">Sélectionnez une taille</option>
                  {sizeOptions.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="block text-sm text-black dark:text-gray-100 mb-2">Couleur</Form.Label>
                <Form.Select
                  name="color"
                  value={product.color || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
                >
                  <option value="">Sélectionnez une couleur</option>
                  {PRODUCT_CONFIG.colors.map(color => (
                    <option key={color} value={color}>
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="block text-sm text-black dark:text-gray-100 mb-2">Marque</Form.Label>
                <Form.Control
                  type="text"
                  name="brand"
                  value={product.brand || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Check
              type="checkbox"
              id="isFeatured"
              label="Mettre en avant ce produit"
              name="isFeatured"
              checked={product.isFeatured || false}
              onChange={handleChange}
              className="block text-sm text-black dark:text-gray-100 mb-2"
            />
          </Form.Group>

          <div className="flex justify-center gap-4 pt-4">
            <Button
              type="submit"
              title="Update"
              leftIcon={<FaSave />}
              containerClass="flex-center gap-2"
              className="text-white bg-black"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Mettre à jour'}
            </Button>

            <Button
              type="button"
              title="Cancel"
              onClick={() => navigate(-1)}
              leftIcon={<FaTimes />}
              containerClass="flex-center gap-2"
              className="text-black bg-gray-200 hover:bg-gray-300"
            />
          </div>
        </form>
      </div>
    </Container>
  );
}