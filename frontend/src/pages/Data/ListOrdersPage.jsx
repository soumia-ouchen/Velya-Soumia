import { useState, useEffect, useCallback, useMemo } from "react";
import { TiRefresh } from "react-icons/ti";
import { FaWhatsapp } from "react-icons/fa";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import Button from "../../components/common/Button";
import DataApi from "../../services/dataApi";
import { FaPlus } from "react-icons/fa";

// Constantes pour les options de filtre
const FILTER_OPTIONS = {
  STATUS: [
    { value: "", label: "Tous" },
    { value: "New", label: "New" },
    { value: "Assigned", label: "Assigned" },
    { value: "Pending", label: "Pending" },
    { value: "Out of stock", label: "Out of stock" }
  ],
  MESSAGE_STATUS: [
    { value: "", label: "Tous" },
    { value: "true", label: "Envoyé" },
    { value: "false", label: "Non envoyé" }
  ],
  COUNTRY: [
    { value: "", label: "Tous" },
    { value: "KSA", label: "Arabie Saoudite" },
    { value: "UAE", label: "Émirats Arabes Unis" },
    { value: "OM", label: "Oman" }
  ]
};

// Composants utilitaires
const LoadingSpinner = () => (
  <div className="text-center my-12">
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#64FF07]"></div>
    <p className="mt-4 text-black dark:text-gray-100">Chargement des commandes...</p>
  </div>
);

const ErrorMessage = ({ error, onRetry }) => (
  <div className="bg-red-100 dark:bg-red-700 text-red-800 dark:text-red-100 p-4 rounded-lg mb-6">
    <h3 className="font-bold mb-2">Erreur lors du chargement</h3>
    <p className="mb-4">{error}</p>
    <Button
      onClick={onRetry}
      className="bg-red-600 hover:bg-red-700 text-white"
      leftIcon={<TiRefresh />}
      title="Réessayer"
    />
  </div>
);

const OrderStatusBadge = ({ status }) => {
  const statusColors = {
    'New': 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100',
    'Assigned': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100',
    'Pending': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-100',
    'Out of stock': 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const OrdersTable = ({ orders }) => {
  const formatDate = useCallback((dateString) => {
    return dateString ? format(parseISO(dateString), 'PPP', { locale: fr }) : "N/A";
  }, []);

  return (
    <div className="mt-6 overflow-x-auto shadow-lg rounded-lg border border-[#64FF07]">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reference</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lead ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Téléphone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ville</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pays</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Produit</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SKU</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantité</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
          {orders.map((order) => {
            const hasError = order.commandeId?.statusMsg;
            const rowClass = hasError ? 'bg-red-50 dark:bg-red-900/30' : 'bg-green-50 dark:bg-green-900/30';
            const textClass = hasError ? 'text-red-800 dark:text-red-100' : 'text-green-800 dark:text-green-100';
            
            return (
              <tr key={order._id} className={rowClass}>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${textClass}`}>{order.reference}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${textClass}`}>{order.commandeId?.leadID || "N/A"}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${textClass}`}>{order.clientId?.customerName || "N/A"}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${textClass}`}>{order.clientId?.customerPhone || "N/A"}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${textClass}`}>{order.clientId?.customerCity || "N/A"}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${textClass}`}>{order.clientId?.customerCountry || "N/A"}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${textClass}`}>
                  <OrderStatusBadge status={order.commandeId?.status} />
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${textClass}`}>{order.produitId?.productName || "N/A"}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${textClass}`}>{order.produitId?.sku || "N/A"}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${textClass}`}>{order.produitId?.quantity || "N/A"}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${textClass}`}>
                  {order.produitId?.total ? `${order.produitId.total}` : "N/A"}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${textClass}`}>
                  {formatDate(order.commandeId?.updatedAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const OrdersPage = () => {
  const [state, setState] = useState({
    data: { confirmer: [] },
    loading: true,
    error: null,
    sending: false
  });

  const [filters, setFilters] = useState({
    country: "",
    status: "",
    dateUpload: "",
    statusMsg: ""
  });

  // Fonction pour récupérer les données
  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Utilisation du service DataApi
      const result = await DataApi.getAllOrders();
      
      setState(prev => ({
        ...prev,
        data: result,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || "Erreur lors du chargement des commandes",
        loading: false
      }));
    }
  }, []);

  // Filtrage des commandes
  const filteredOrders = useMemo(() => {
    return state.data.confirmer.filter((order) => {
      const countryMatch = !filters.country || order.clientId?.customerCountry === filters.country;
      const statusMatch = !filters.status || order.commandeId?.status === filters.status;
      const statusMsgMatch = filters.statusMsg === "" || 
        order.commandeId?.statusMsg === (filters.statusMsg === "true");
      
      const uploadDate = order.commandeId?.updatedAt
        ? format(parseISO(order.commandeId.updatedAt), 'yyyy-MM-dd')
        : null;
      const dateUploadMatch = !filters.dateUpload || uploadDate === filters.dateUpload;

      return countryMatch && statusMatch && dateUploadMatch && statusMsgMatch;
    });
  }, [state.data.confirmer, filters]);

  // Gestion du rafraîchissement
  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Gestion des changements de filtre
  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  // Envoi des messages WhatsApp
  const sendWhatsAppMessages = useCallback(async () => {
    setState(prev => ({ ...prev, sending: true }));

    try {
      const today = new Date().getDay();
      const messagesToSend = filteredOrders
        .filter(order => order.clientId?.customerPhone)
        .map(order => {
          const number = order.clientId.customerPhone;
          const status = order.commandeId?.status;
          let message = `مرحبًا ${order.clientId.customerName}، نشكرك جزيل الشكر على اختيارك التسوق معنا 🌟.\n\n`;

          if (status === "Assigned") {
            if (today === 3 && order.clientId.customerCountry === "KSA") {
              message += "نود إعلامك أن شحنتك تأخرت قليلًا بسبب عطلة نهاية الأسبوع في المملكة العربية السعودية، لكنها ستُشحن قريبًا بإذن الله.";
            } else if (today === 5 && order.clientId.customerCountry === "UAE") {
              message += "نود إعلامك أن شحنتك تأخرت قليلًا بسبب عطلة نهاية الأسبوع في الإمارات العربية المتحدة، لكنها ستُشحن قريبًا بإذن الله.";
            } else if (today === 4 && order.clientId.customerCountry === "OM") {
              message += "نود إعلامك أن شحنتك تأخرت قليلًا بسبب عطلة نهاية الأسبوع في سلطنة عمان، لكنها ستُشحن قريبًا بإذن الله.";
            } else {
              message += "يسرّنا إعلامك بأنه قد تم تعيين طلبك لأحد مندوبي التوصيل بنجاح 🚚، وسيتم شحنه إليك في أقرب وقت ممكن. ترقّب رسائل التحديث!";
            }
          } else {
            if (status === "Pending") {
              message += "طلبك حاليًا قيد المعالجة من قبل فريقنا المختص 🔧. نحن نعمل على تجهيزه بأسرع وقت ممكن وسيتم شحنه قريبًا. شكراً لصبرك وثقتك بنا.";
            } else if (status === "New") {
              message += "لقد تم استلام طلبك بنجاح ✅ وهو الآن في قائمة الطلبات الجديدة. سيبدأ فريقنا فورًا في معالجته وتجهيزه للشحن. شكراً لاختيارك لنا!";
            } else if (status === "Out of stock") {
              message += "نأسف لإبلاغك أن المنتج الذي قمت بطلبه غير متوفر حاليًا ❌. نحن نعمل على إعادة توفيره في أقرب وقت، وسنقوم بإعلامك فور توفره من جديد. نشكرك على تفهمك.";
            }

          }

          return { number, message, orderId: order.commandeId };
        });

      // Envoi des messages via le service DataApi
      const result = await DataApi.sendWhatsAppMessages(messagesToSend);
      
      if (result.success) {
        // Mise à jour des données après envoi
        await fetchData();
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi des messages:", error);
    } finally {
      setState(prev => ({ ...prev, sending: false }));
    }
  }, [filteredOrders, fetchData]);

  // Effet de chargement initial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (state.loading) return <LoadingSpinner />;
  if (state.error) return <ErrorMessage error={state.error} onRetry={handleRefresh} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-black p-6 border-[#64FF07] border-2 rounded-lg shadow-lg">
        <h2 className="special-font text-5xl text-center mb-6 text-black dark:text-gray-100">
          <b>Tableau des commandes</b>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <FilterSelect 
            id="country"
            name="country"
            label="Pays"
            value={filters.country}
            onChange={handleFilterChange}
            options={FILTER_OPTIONS.COUNTRY}
          />
          
          <FilterSelect 
            id="status"
            name="status"
            label="Statut"
            value={filters.status}
            onChange={handleFilterChange}
            options={FILTER_OPTIONS.STATUS}
          />
          
          <FilterSelect 
            id="statusMsg"
            name="statusMsg"
            label="Statut Message"
            value={filters.statusMsg}
            onChange={handleFilterChange}
            options={FILTER_OPTIONS.MESSAGE_STATUS}
          />
          
          <div>
            <label htmlFor="dateUpload" className="block text-sm text-black dark:text-gray-100 mb-2">
              Date
            </label>
            <input
              type="date"
              id="dateUpload"
              name="dateUpload"
              value={filters.dateUpload}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-[#64FF07] focus:border-[#64FF07] bg-white dark:bg-gray-800 text-black dark:text-gray-100"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <Button
            onClick={handleRefresh}
            leftIcon={<TiRefresh />}
            title="Rafraîchir"
            containerClass="flex-center gap-2"
            className="text-white bg-black"
            disabled={state.loading}
          />

          {/* Button vers pages importexcel */}
          <Button
            leftIcon={<FaPlus />}
            onClick={() => navigator("/importData")}
            title="Importer Excel"
            containerClass="flex-center gap-2"
            className="text-white bg-black"
            disabled={state.loading}
          />
          
          <Button
            onClick={sendWhatsAppMessages}
            leftIcon={<FaWhatsapp />}
            title={`Envoyer Messages (${filteredOrders.length})`}
            containerClass="flex-center gap-2"
            className="text-white bg-black"
            disabled={state.sending || filteredOrders.length === 0}
            loading={state.sending}
          />
        </div>

        {filteredOrders.length > 0 ? (
          <OrdersTable orders={filteredOrders} />
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-100 px-4 py-3 rounded-lg">
            Aucune commande ne correspond aux filtres sélectionnés
          </div>
        )}
      </div>
    </div>
  );
};

// Composant de filtre réutilisable
const FilterSelect = ({ id, name, label, value, onChange, options }) => (
  <div>
    <label htmlFor={id} className="block text-sm text-black dark:text-gray-100 mb-2">
      {label}
    </label>
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-[#64FF07] focus:border-[#64FF07] bg-white dark:bg-gray-800 text-black dark:text-gray-100"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

export default OrdersPage;