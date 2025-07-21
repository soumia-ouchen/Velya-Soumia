import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/common/Button";
import { FaSave, FaTimes } from "react-icons/fa";
import offerapi from '../../services/offerApi';

const CreateOfferPage = () => {
  const [formData, setFormData] = useState({
    image: null,
    text: '',
    storeUrl: ''
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();


  useEffect(() => {
    if (id) {
      const fetchOffer = async () => {
        try {
          const offer = await offerapi.getOfferById(id);
          setFormData({
            text: offer.text || '',
            storeUrl: offer.storeUrl || '',
            image: null
          });
          if (offer.image) {
            setPreviewImage(`${offer.image}`);
          }
        } catch (error) {
          console.error('Error fetching offer:', error);
        }
      };
      fetchOffer();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });
  
    try {
      setLoading(true);
      if (id) {
        await offerapi.updateOffer(id, data);
      } else {
        await offerapi.createOffer(data);
      }
      navigate('/offersListPage');
    } catch (error) {
      console.error('Error saving offer:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-black p-6 border-[#64FF07] border-2 rounded-lg shadow-lg">
        <h2 className="special-font text-5xl text-center mb-6 text-black dark:text-gray-100">
          <b>{id ? 'Edit Offer' : 'Create Offer'}</b>
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-black dark:text-gray-100 mb-2">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-black hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-100 dark:hover:file:bg-gray-600"
            />
            
            {previewImage && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="max-h-64 rounded-lg border border-gray-200 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setFormData(prev => ({ ...prev, image: null }));
                  }}
                  className="px-4 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition"
                >
                  Remove image
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-black dark:text-gray-100 mb-2">
              Description
            </label>
            <textarea
              name="text"
              value={formData.text}
              onChange={handleInputChange}
              rows="5"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
              required
            />
          </div>


          <div>
            <label className="block text-sm text-black dark:text-gray-100 mb-2">
              Store URL
            </label>
            <input
              type="url"
              name="storeUrl"
              value={formData.storeUrl}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
              placeholder="https://example.com"
            />
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button
              type="submit"
              title={loading ? "Processing..." : (id ? "Update" : "Create")}
              leftIcon={<FaSave />}
              containerClass="flex-center gap-2"
              className="text-white bg-black"
              disabled={loading}
            />
            <Button
              type="button"
              title="Cancel"
              leftIcon={<FaTimes />}
              containerClass="flex-center gap-2"
              className="text-black bg-gray-200 hover:bg-gray-300"
              onClick={() => navigate('/offers')}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOfferPage;