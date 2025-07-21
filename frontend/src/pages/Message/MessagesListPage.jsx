// src/pages/MessagesListPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEdit, FiTrash2, FiCopy, FiSend, FiCalendar, FiFilter } from 'react-icons/fi';
import { FaPlus } from 'react-icons/fa';
import Button from '../../components/common/Button';
import { getAllMessages, deleteMessage } from '../../services/messageApi';

const MessagesListPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageInfo, setMessageInfo] = useState({ text: '', variant: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await getAllMessages();
        setMessages(response.data);
      } catch (err) {
        setMessageInfo({
          text: err.response?.data?.message || 'Failed to fetch messages',
          variant: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await deleteMessage(id);
      setMessages(messages.filter(msg => msg._id !== id));
      setMessageInfo({
        text: 'Message deleted successfully!',
        variant: 'success'
      });
    } catch (err) {
      setMessageInfo({
        text: err.response?.data?.message || 'Failed to delete message',
        variant: 'error'
      });
    }
  };

  const filteredMessages = messages.filter(msg => {


    // Filtre par recherche
    const matchesSearch = searchTerm === '' ||
      msg.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         msg.content.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtre par date
    const matchesDate = dateFilter === '' ||
      new Date(msg.createdAt).toLocaleDateString() === new Date(dateFilter).toLocaleDateString();

    // Filtre par statut d'envoi
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'sent' && msg.statusSend) ||
      (statusFilter === 'unsent' && !msg.statusSend);

    return matchesSearch && matchesDate && matchesStatus;
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessageInfo({
      text: 'Message copied to clipboard!',
      variant: 'success'
    });
  };

  const sendTestMessage = async (messageId) => {
    try {
      await axios.post(`http://localhost:5000/api/whatsapp/send-message`, { messageId });
      setMessageInfo({
        text: 'Test message sent successfully!',
        variant: 'success'
      });
      // Mettre à jour le statut d'envoi dans la liste
      setMessages(messages.map(msg =>
        msg._id === messageId ? { ...msg, statusSend: true } : msg
      ));
    } catch (err) {
      setMessageInfo({
        text: err.response?.data?.message || 'Failed to send test message',
        variant: 'error'
      });
    }
  };

  if (loading) return (

    <div className="text-center my-12">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#64FF07]"></div>
      <p className="mt-4 text-black dark:text-gray-100">Chargement des messages...</p>
    </div>

  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-black p-6 border-[#64FF07] border-2 rounded-lg shadow-lg">
        <h2 className="special-font text-5xl text-center mb-6 text-black dark:text-gray-100">
          <b>Predefined Messages</b>
        </h2>

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

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#64FF07] focus:border-transparent"
              />
            </div>

            <Button
              onClick={() => navigate('/createMessages')}
              leftIcon={<FaPlus />}
              containerClass="flex-center gap-2"
              className="text-white bg-black"
            >
              New Message
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-4">

              <div className="relative flex-1">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#64FF07] focus:border-transparent appearance-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="sent">Sent</option>
                  <option value="unsent">Unsent</option>
                </select>
                <FiFilter className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>

            <div className="relative flex-1">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#64FF07] focus:border-transparent"
              />
              <FiCalendar className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center text-black dark:text-white">
            No messages found
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMessages.map((message) => (
              <div
                key={message._id}  
                className={`bg-white dark:bg-gray-800 p-4 border rounded-lg shadow-sm ${message.statusSend
                  ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                  : "border-gray-200 dark:border-gray-700"
                  }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-black dark:text-white">
                    {message.title}
                  </h3>

                  <div className="flex items-center gap-2">
                    {message.statusSend && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 rounded-full">
                        Sent
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="mb-4 whitespace-pre-line text-black dark:text-gray-300">
                  {message.content}
                </p>

                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => copyToClipboard(message.content)}
                    title={"Copy"}
                    leftIcon={<FiCopy />}
                    containerClass="flex-center gap-2"
                    className="text-white bg-black"
                  >
                    Copy
                  </Button>
                  <Button
                    onClick={() => sendTestMessage(message._id)}
                    title={"Send Message"}
                    leftIcon={<FiSend />}
                    containerClass="flex-center gap-2"
                    className="text-white bg-black"
                  >
                    Send
                  </Button>
                  <Button
                    onClick={() => navigate(`/messages/edit/${message._id}`)}
                    title={"Edit"}
                    leftIcon={<FiEdit />}
                    containerClass="flex-center gap-2"
                    className="text-white bg-black"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(message._id)}
                    title={"Delete"}
                    leftIcon={<FiTrash2 />}
                    containerClass="flex-center gap-2"
                    className="text-white bg-black"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesListPage;