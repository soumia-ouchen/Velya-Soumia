/* eslint-disable tailwindcss/no-custom-classname */
import { useState, useEffect } from 'react';
import { Container, Form,Alert, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import Button from "../../components/common/Button";
import { FaSave, FaTimes } from "react-icons/fa";



// Configuration des options (pourrait être dans un fichier séparé)
const PRODUCT_CONFIG = {
  categories: ["vêtements", "chaussures", "accessoires", "électronique", "maison", "beauté"],
  colors: ["noir", "blanc", "rouge", "bleu", "vert", "jaune", "gris", "rose"],
  sizeMap: {
    vêtements: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
    chaussures: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
    accessoires: ["TU", "ONE SIZE"],
    default: ["UNIQUE"]
  },
  initialProductState: {
    SKU: '',
    name: '',
    description: '',
    price: 0,
    image: null,
    imageDes: null,
    category: 'vêtements',
    color: '',
    size: '',
    brand: '',
    isFeatured: false,
  }
};

const CreateProductPage = () => {
  const [productData, setProductData] = useState(PRODUCT_CONFIG.initialProductState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [previewImageDes, setPreviewImageDes] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Validation des données
  const validateForm = () => {
    const errors = {};
    let isValid = true;






    // Validation prix
    if (productData.price <= 0) {
      errors.price = 'Le prix doit être supérieur à 0';
      isValid = false;
    } else if (productData.price > 10000) {
      errors.price = 'Le prix ne peut pas dépasser 10 000';
      isValid = false;
    }

    // Validation image principale
    if (!productData.image) {
      errors.image = 'Une image principale est requise';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérification du type de fichier
    if (!file.type.match('image.(jpeg|jpg|png|gif)')) {
      setFormErrors({...formErrors, image: 'Seuls les formats JPEG, JPG, PNG et GIF sont acceptés'});
      return;
    }

    // Vérification de la taille du fichier (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setFormErrors({...formErrors, image: 'L\'image ne doit pas dépasser 2MB'});
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
    
    setProductData(prev => ({
      ...prev,
      image: file
    }));
    
    setFormErrors({...formErrors, image: ''});
  };

  const handleImageChangeDes = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.(jpeg|jpg|png|gif)')) {
      setFormErrors({...formErrors, imageDes: 'Seuls les formats JPEG, JPG, PNG et GIF sont acceptés'});
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFormErrors({...formErrors, imageDes: 'L\'image ne doit pas dépasser 2MB'});
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreviewImageDes(reader.result);
    reader.readAsDataURL(file);
    
    setProductData(prev => ({
      ...prev,
      imageDes: file
    }));
    
    setFormErrors({...formErrors, imageDes: ''});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setProductData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Réinitialiser la taille si la catégorie change
    if (name === 'category') {
      setProductData(prev => ({
        ...prev,
        size: ''
      }));
    }
  };

  const resetForm = () => {
    setProductData(PRODUCT_CONFIG.initialProductState);
    setPreviewImage(null);
    setPreviewImageDes(null);
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form with data:', productData);
    console.log('Form errors:', formErrors);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('SKU', productData.SKU.toUpperCase());
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('price', parseFloat(productData.price));
      formData.append('category', productData.category);
      formData.append('color', productData.color);
      formData.append('size', productData.size || PRODUCT_CONFIG.sizeMap.default[0]);
      formData.append('brand', productData.brand);
      formData.append('isFeatured', productData.isFeatured);
      formData.append('imageProduct', productData.image);
      formData.append('imageDescription', productData.imageDes);
      console.log('FormData:', formData);
      console.log('FormData entries:', Array.from(formData.entries()));
      const response = await axios.post('http://localhost:5000/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        setSuccess('Produit créé avec succès! Redirection...');
        resetForm();
        
        // Redirection après 2 secondes
        setTimeout(() => {
          // Ici vous pourriez rediriger vers la liste des produits
          // navigate('/products');
        }, 2000);
      }
    } catch (err) {
      let errorMsg = 'Erreur lors de la création du produit';
      
      if (err.response) {
        if (err.response.status === 409) {
          errorMsg = 'Un produit avec ce SKU existe déjà';
        } else {
          errorMsg = err.response.data?.message || err.response.data?.error || errorMsg;
        }
      }
      
      setError(errorMsg);
      console.error('Erreur création produit:', err);
    } finally {
      setLoading(false);
    }
  };

  // Effacer les messages après 5 secondes
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Options de tailles basées sur la catégorie sélectionnée
  const sizeOptions = PRODUCT_CONFIG.sizeMap[productData.category] || PRODUCT_CONFIG.sizeMap.default;

  return (
    <Container className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-black p-6 border-[#64FF07] border-2 rounded-lg shadow-lg">
        <h2 className="special-font text-5xl text-center mb-6 text-black dark:text-gray-100">
          <b>              Creer un Nouveau Produit</b>
        </h2>

              {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                  <Alert.Heading>Erreur</Alert.Heading>
                  <p>{error}</p>
                </Alert>
              )}
              
              {success && (
                <Alert variant="success" onClose={() => setSuccess('')} dismissible>
                  <Alert.Heading>Succès</Alert.Heading>
                  <p>{success}</p>
                </Alert>
              )}

              <form  className="space-y-6" onSubmit={handleSubmit} noValidate>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                <Form.Label className="block text-sm text-black dark:text-gray-100 mb-2">SKU <samp className='text-[#FF0000]'>*</samp></Form.Label>
                      <Form.Control
                        type="text"
                        name="SKU"
                        value={productData.SKU}
                  onChange={handleChange}
                        required
                        placeholder="Ex: PROD-001"
                        maxLength="20"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"

                      />

                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                <Form.Label className="block text-sm text-black dark:text-gray-100 mb-2">Nom du Produit <samp className='text-[#FF0000]'>*</samp></Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={productData.name}
                  onChange={handleChange}
                        required
                        placeholder="Nom complet du produit"
                        maxLength="100"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"

                      />

                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                <Form.Label className="block text-sm text-black dark:text-gray-100 mb-2">
              Description <samp className='text-[#FF0000]'>*</samp>
                </Form.Label>      
                 <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={productData.description}
              onChange={handleChange}
                    required
                    placeholder="Description détaillée du produit"
                    maxLength="1000"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"

                  />

                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                <Form.Label className="block text-sm text-black dark:text-gray-100 mb-2">
                  Image Produit <samp className='text-[#FF0000]'>*</samp>
                </Form.Label>
                      <Form.Control
                        type="file"
                        name="image"
                        accept="image/jpeg, image/png, image/gif"
                        onChange={handleImageChange}
                        isInvalid={!!formErrors.image}
                        required
                        className="block w-full text-sm text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-black hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-100 dark:hover:file:bg-gray-600"

                      />
                      <Form.Text className="text-muted">
                        Format JPEG, PNG ou GIF (max 2MB)
                      </Form.Text>
                      <Form.Control.Feedback type="invalid">
                        {formErrors.image}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    {previewImage && (
                      <div className="mt-4 flex flex-col items-center gap-2">
                        <img
                          src={previewImage}
                          alt="Aperçu image principale"
                          className="max-h-64 rounded-lg border border-gray-200 dark:border-gray-600"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/100?text=Image+non+valide';
                          }}
                        />
                        <button
                          size="sm"
                          onClick={() => {
                            setPreviewImage(null);
                            setProductData(prev => ({ ...prev, image: null }));
                          }}
                          className="px-4 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition"

                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                <Form.Label className="block text-sm text-black dark:text-gray-100 mb-2">
                  Image Description </Form.Label>
                      <Form.Control
                        type="file"
                        name="imageDes"
                        accept="image/jpeg, image/png, image/gif"
                        onChange={handleImageChangeDes}
                        isInvalid={!!formErrors.imageDes}
                        className="block w-full text-sm text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-black hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-100 dark:hover:file:bg-gray-600"

                      />
                      <Form.Text className="text-muted">
                        Optionnelle - Format JPEG, PNG ou GIF (max 2MB)
                      </Form.Text>
                      <Form.Control.Feedback type="invalid">
                        {formErrors.imageDes}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    {previewImageDes && (
                      <div className="mt-4 flex flex-col items-center gap-2">
                        <img
                          src={previewImageDes}
                          alt="Aperçu image secondaire"
                          className="max-h-64 rounded-lg border border-gray-200 dark:border-gray-600"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/100?text=Image+non+valide';
                          }}
                        />
                        <button
                          size="sm"
                          onClick={() => {
                            setPreviewImageDes(null);
                            setProductData(prev => ({ ...prev, imageDes: null }));
                          }}
                          className="px-4 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition"

                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                <Form.Label className="block text-sm text-black dark:text-gray-100 mb-2">Prix <samp className='text-[#FF0000]'>*</samp></Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        value={productData.price}
                        onChange={handleChange}
                        min="0.01"
                        step="0.01"
                        max="10000"
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
                <Form.Label className="block text-sm text-black dark:text-gray-100 mb-2">Catégorie <samp className='text-[#FF0000]'>*</samp></Form.Label>
                      <Form.Select
                        name="category"
                        value={productData.category}
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
                        value={productData.size}
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
                      <Form.Label  className="block text-sm text-black dark:text-gray-100 mb-2">Couleur</Form.Label>
                      <Form.Select
                        name="color"
                        value={productData.color}
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
                        value={productData.brand}
                        onChange={handleChange}
                        placeholder="Marque du produit"
                        maxLength="50"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"

                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                checked={productData.isFeatured}
                onChange={handleChange}
                className="h-5 w-5 text-green-600 rounded focus:ring-green-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                style={{
                  accentColor: '#64FF07',
                  backgroundColor: '#64FF07',
                  borderColor: '#64FF07',
                  padding: '0.5rem',
                  margin: '0.5rem 0',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
              />
              <label
                htmlFor="isFeatured"
                className="ml-2 block text-sm text-black dark:text-gray-100"
              >
                Produit en vedette
              </label>
            </div>
                </Form.Group>

                          <div className="flex justify-center gap-4 pt-4">
                            <Button
                              type="submit"
                              title="Create"
                              leftIcon={<FaSave />}
                              containerClass="flex-center gap-2"
                              className="text-white bg-black"
                              disabled={loading}
                                            >
                                  {loading ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                      Création en cours...
                                    </>
                                  ) : (
                                    'Créer le Produit'
                                  )}
                                </Button>
                  
            
                            <Button
                              type="button"
                              title="Cancel"
                              onClick={resetForm}
                              leftIcon={<FaTimes />}
                              containerClass="flex-center gap-2"
                              className="text-black bg-gray-200 hover:bg-gray-300"
                            />

                   </div>
              </form>
   
      </div>
    </Container>
  );
};



export default CreateProductPage;