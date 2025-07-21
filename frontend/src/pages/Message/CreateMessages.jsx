// src/pages/CreateMessages.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation  } from 'react-router-dom';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import Button from '../../components/common/Button';
import { getMessageById, createMessage, updateMessage } from '../../services/messageApi';

const initialMessageState = {
  title: '',
  content: '',
};

const CreateMessages = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState(initialMessageState);
  const [loading, setLoading] = useState(false);
  const [messageInfo, setMessageInfo] = useState({ text: '', variant: '' });
  const [errors, setErrors] = useState({});
  const isEditing = !!id;

  useEffect(() => {
    if (id) {
      const fetchMessage = async () => {
        try {
          const response = await getMessageById(id);
          setMessage(response.data);
        } catch (err) {
          setMessageInfo({
            text: err.response?.data?.message || 'Failed to load message',
            variant: 'error'
          });
        }
      };
      fetchMessage();
    } else if (location.pathname === '/createMessages') {
      setMessage(initialMessageState);
    }
  }, [id, location.pathname]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMessage(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!message.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (message.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (!message.content.trim()) {
      newErrors.content = 'Message content is required';
    } else if (message.content.length > 1000) {
      newErrors.content = 'Message must be less than 1000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setMessageInfo({ text: '', variant: '' });

    try {
      if (isEditing) {
        await updateMessage(id, message);
        setMessageInfo({
          text: 'Message updated successfully!',
          variant: 'success'
        });
      } else {
        await createMessage(message);
        setMessageInfo({
          text: 'Message created successfully!',
          variant: 'success'
        });
      }
      
      setTimeout(() => navigate('/MessagesListPage'), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                     (isEditing ? 'Failed to update message' : 'Failed to create message');
      setMessageInfo({
        text: errorMsg,
        variant: 'error'
      });
      
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/MessagesListPage');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-black p-6 border-[#64FF07] border-2 rounded-lg shadow-lg">
        <div className="flex items-center mb-6">
          <Button
            onClick={handleBack}
            title="list Messages"
            leftIcon={<FiArrowLeft />}
            containerClass="mr-4"
            className="text-black dark:text-white"
            aria-label="Back to messages"
          />
          <h2 className="special-font text-5xl text-black dark:text-gray-100">
            <b>{isEditing ? 'Edit WhatsApp Message' : 'Create New WhatsApp Message'}</b>
          </h2>
        </div>
        
        {messageInfo.text && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
              messageInfo.variant === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100"
                : "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100"
            }`}
          >
            {messageInfo.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm text-black dark:text-gray-100 mb-2"
            >
              Message Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={message.title}
              onChange={handleChange}
              className={`block w-full px-4 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border ${
                errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:ring-2 focus:ring-[#64FF07] focus:border-transparent`}
              placeholder="e.g. Welcome Message"
              maxLength={100}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.title}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm text-black dark:text-gray-100 mb-2"
            >
              Message Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={message.content}
              onChange={handleChange}
              rows={8}
              className={`block w-full px-4 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border ${
                errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:ring-2 focus:ring-[#64FF07] focus:border-transparent`}
              placeholder="Write your message here..."
              maxLength={1000}
            />
            <div className="flex justify-between mt-1">
              {errors.content && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.content}</p>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {message.content.length}/1000
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              title="Cancel"
              onClick={handleBack}
              leftIcon={<FiArrowLeft />}
              containerClass="flex-center gap-2"
              className="text-white bg-black"          >
              
            </Button>
            <Button
              type="submit"
              title={loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update' : 'Create')}
              disabled={loading}
              leftIcon={<FiSave />}
              containerClass="flex-center gap-2"
              className="text-black bg-gray-200 hover:bg-gray-300"            >
              {loading ? (
                <span>{isEditing ? 'Saving...' : 'Creating...'}</span>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Create Message'}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMessages;