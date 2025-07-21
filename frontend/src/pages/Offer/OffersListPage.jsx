import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { FaPlus, FaEdit, FaTrash, FaShare, FaSearch, FaFilter, FaCalendarAlt } from "react-icons/fa";
import offerApi from "../../services/offerApi"; 

const OffersListPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [messageInfo, setMessageInfo] = useState({ text: "", variant: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const data = await offerApi.getAllOffers();
      setOffers(data);
    } catch (error) {
      console.error('Error loading offers:', error);
      setMessageInfo({
        text: 'Failed to load offers',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      await offerApi.deleteOffer(offerId );
      setMessageInfo({
        text: 'Offer deleted successfully',
        variant: 'success'
      });
      fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      setMessageInfo({
        text: 'Failed to delete offer',
        variant: 'error'
      });
    }
  };

  const shareOffer = async (offerId) => {
    try {
      const result = await offerApi.shareOfferViaWhatsApp(offerId);
      setMessageInfo({
        text: result.message || 'Offer shared successfully',
        variant: 'success'
      });
      // Update the status in local state
      setOffers(offers.map(offer =>
        offer._id === offerId ? { ...offer, statusSend: true } : offer
      ));
    } catch (error) {
      console.error('Error sharing offer:', error);
      setMessageInfo({
        text: 'Failed to share offer',
        variant: 'error'
      });
    }
  };

  const filteredOffers = offers.filter(offer => {
    // Filter by search term
    const matchesSearch = searchTerm === "" ||
      offer.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (offer.storeUrl && offer.storeUrl.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter by date
    const matchesDate = dateFilter === "" ||
      new Date(offer.createdAt).toLocaleDateString() === new Date(dateFilter).toLocaleDateString();

    // Filter by status
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "sent" && offer.statusSend) ||
      (statusFilter === "unsent" && !offer.statusSend);

    return matchesSearch && matchesDate && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-black p-6 border-[#64FF07] border-2 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-8">
          <h2 className="special-font text-5xl text-black dark:text-gray-100">
            <b>Offers List</b>
          </h2>
          <Button
            title="Créer une offre"
            leftIcon={<FaPlus />}
            containerClass="flex-center gap-2"
            className="text-white bg-black"
            onClick={() => navigate('/createOffer')}
          />
        </div>

        {messageInfo.text && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${messageInfo.variant === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100"
              : "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100"
              }`}
          >
            {messageInfo.text}
          </div>
        )}

        <div className="flex flex-col gap-4 mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Chercher offres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#64FF07] focus:border-transparent"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#64FF07] focus:border-transparent appearance-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="sent">Envoyé</option>
                <option value="unsent">Non envoyé</option>
              </select>
              <FaFilter className="absolute left-3 top-3 text-gray-400" />
            </div>

            <div className="relative flex-1">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#64FF07] focus:border-transparent"
              />
              <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>

        {loading ? (

          <div className="text-center my-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#64FF07]"></div>
            <p className="mt-4 text-black dark:text-gray-100">Chargement des offers...</p>
          </div>

        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-12 text-black dark:text-gray-300">
              <p className="text-xl">No offers match your criteria</p>

          </div>
        ) : (
              <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                {filteredOffers.map(offer => (
                  <div
                    key={offer._id}
                    className={`border rounded-lg overflow-hidden transition-all hover:shadow-lg ${offer.statusSend
                      ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                      : "border-gray-200 dark:border-gray-700"
                      }`}
                  >
                {offer.image && (
                  <img
                    src={offer.image}
                    alt="Offer"
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <p className="text-black dark:text-gray-100 mb-3">{offer.text}</p>
                  {offer.storeUrl && (
                    <a
                      href={offer.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-blue-500 hover:underline mb-4"
                    >
                      Visit Store
                    </a>
                  )}
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(offer.createdAt).toLocaleDateString()}
                        </span>
                        {offer.statusSend && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 rounded-full">
                            envoyé
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-5">
                    <Button
                          title="Modifier"
                      leftIcon={<FaEdit />}
                      containerClass="flex-center gap-1"
                      className="text-black bg-gray-200 hover:bg-gray-300"
                      onClick={() => navigate(`/offers/edit/${offer._id}`)}
                    />
                    <Button
                          title="Partager"
                      leftIcon={<FaShare />}
                      containerClass="flex-center gap-1"
                      className="text-white bg-black"
                      onClick={() => shareOffer(offer._id)}
                    />
                    <Button
                          title="Supprimer"
                      leftIcon={<FaTrash />}
                      containerClass="flex-center gap-1"
                      className="text-white bg-red-600 hover:bg-red-700"
                      onClick={() => deleteOffer(offer._id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersListPage;