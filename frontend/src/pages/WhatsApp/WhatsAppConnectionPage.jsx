import { useState, useEffect } from "react";
import Button from "../../components/common/Button";
import { FaWhatsapp, FaQrcode, FaSyncAlt, FaTimes, FaExternalLinkAlt } from "react-icons/fa";

const WhatsAppConnection = () => {
  const [connection, setConnection] = useState({
    status: "disconnected",
    qrCode: null,
    error: null,
    sessionInfo: null // Ajout pour stocker des infos supplémentaires de session
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpeningWhatsApp, setIsOpeningWhatsApp] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/whatsapp/status");
      const data = await response.json();

      setConnection({
        status: data.status,
        qrCode: data.qrCode,
        error: data.error,
        sessionInfo: data.sessionInfo || null
      });
    } catch (err) {
      console.error("Error fetching status:", err);
      setConnection(prev => ({
        ...prev,
        error: "Failed to fetch status"
      }));
    }
  };

  const initConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/whatsapp/init", {
        method: "POST"
      });
      const data = await response.json();

      if (data.error) {
        setConnection(prev => ({
          ...prev,
          error: data.error
        }));
      } else {
        // Vérifier l'état après 1 seconde
        setTimeout(fetchStatus, 1000);
      }
    } catch (err) {
      console.error("Error initializing connection:", err);
      setConnection(prev => ({
        ...prev,
        error: "Failed to initialize connection"
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    setIsLoading(true);
    try {
      await fetch("http://localhost:5000/api/whatsapp/logout", { method: "POST" });
      await fetchStatus();
    } catch (err) {
      console.error("Error disconnecting:", err);
      setConnection(prev => ({
        ...prev,
        error: "Failed to disconnect"
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const openWhatsAppWeb = async () => {
    setIsOpeningWhatsApp(true);
    try {
      // Optionnel: Vérifier la session côté serveur avant d'ouvrir
      const sessionCheck = await fetch("http://localhost:5000/api/whatsapp/check-session");
      const sessionData = await sessionCheck.json();

      if (sessionData.valid) {
        window.open("https://web.whatsapp.com", "_blank", "noopener,noreferrer");
      } else {
        setConnection(prev => ({
          ...prev,
          error: "Session invalide, veuillez vous reconnecter"
        }));
      }
    } catch (err) {
      console.error("Error checking session:", err);
      setConnection(prev => ({
        ...prev,
        error: "Erreur lors de l'ouverture de WhatsApp"
      }));
    } finally {
      setIsOpeningWhatsApp(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderStatus = () => {
    switch (connection.status) {
      case "connected":
        return (
          <div className="bg-transparent dark:bg-black flex flex-col items-center">
            <FaWhatsapp className="text-green-500 text-6xl mb-4" />
            <h3 className="text-2xl text-black dark:text-gray-100">Connecté à WhatsApp</h3>
            <br></br>
            {connection.sessionInfo && (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                <p>Connecté en tant que: {connection.sessionInfo.pushname}</p>
                <p>Numéro: {connection.sessionInfo.wid.user}</p>
              </div>
            )}
          </div>
        );
      case "connecting":
        return (
          <>
            <h5 className="text-lg text-black dark:text-gray-100 mb-4">
              Scannez le QR Code avec WhatsApp
            </h5>
            {connection.qrCode ? (
              <div className="flex flex-col items-center">
                <div className="p-4 bg-white rounded-lg border border-gray-200 dark:border-gray-600">
                  <img
                    src={connection.qrCode}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  Scannez ce QR code avec lapplication mobile WhatsApp
                </p>
              </div>
            ) : (
              <div className="flex justify-center my-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#64FF07]"></div>
              </div>
            )}
          </>
        );
      default:
        return (
          <div className="flex flex-col items-center">
            <FaTimes className="text-red-500 text-6xl mb-4" />
            <h3 className="text-2xl text-black dark:text-gray-100">Déconnecté</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {connection.error || "Non connecté à WhatsApp"}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="container  mx-auto px-4 py-8">
      <div className="bg-transparent dark:bg-black p-6 border-[#64FF07] border-2 rounded-lg shadow-lg">
        <h2 className="special-font text-5xl text-center mb-6 text-black dark:text-gray-100">
          <b>WhatsApp Connection</b>
        </h2>

        {connection.error && (
          <div className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium ${connection.status === "connected"
              ? "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100"
              : "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100"
            }`}>
            {connection.error}
          </div>
        )}

        <div className="text-center my-8">
          {renderStatus()}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          {connection.status !== "connected" ? (
            <Button
              onClick={initConnection}
              leftIcon={isLoading ? <FaSyncAlt className="animate-spin" /> : <FaQrcode />}
              title={isLoading ? "Connexion..." : "Connecter"}
              className="text-white bg-black hover:bg-gray-800"
              disabled={isLoading || connection.status === "connecting"}
            />
          ) : (
              <>
                <Button
                  onClick={disconnect}
                leftIcon={<FaTimes />}
                  title="Déconnecter"
                  className="text-white bg-red-600 hover:bg-red-700"
                disabled={isLoading}
                />
                <Button
                  onClick={openWhatsAppWeb}
                  leftIcon={isOpeningWhatsApp ? <FaSyncAlt className="animate-spin" /> : <FaExternalLinkAlt />}
                  title={isOpeningWhatsApp ? "Ouverture..." : "Ouvrir WhatsApp"}
                  className="text-white bg-green-600 hover:bg-green-700"
                  disabled={isOpeningWhatsApp}
                />
              </>
          )}

          <Button
            onClick={fetchStatus}
            leftIcon={<FaSyncAlt />}
            title="Actualiser"
            className="text-black bg-gray-200 hover:bg-gray-300 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600"
            disabled={isLoading || isOpeningWhatsApp}
          />
        </div>

        <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
          {connection.status === "connected" 
            ? "Les messages seront envoyés automatiquement lors du traitement des commandes"
            : "Assurez-vous que votre téléphone est connecté à Internet pendant la configuration"}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConnection;