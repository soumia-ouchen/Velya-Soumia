import { useState } from "react";
import Button from "../../components/common/Button";
import { TiLocationArrow } from "react-icons/ti";
import ExcelApi from "../../services/excelApi";

const validFileTypes = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv'
];

const ImportData = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState({ text: "", variant: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const validateFile = (file) => {
    // Check file type
    if (!validFileTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/)) {
      setMessage({
        text: "Veuillez sélectionner un fichier Excel (xlsx, xls) ou CSV valide",
        variant: "error"
      });
      return false;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ 
        text: "Le fichier est trop volumineux (max 5MB)", 
        variant: "error" 
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      setMessage({ text: "", variant: "" });
      return;
    }

    if (!validateFile(selectedFile)) {
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setMessage({
      text: `Fichier sélectionné : ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`,
      variant: "success"
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault(); // Prevent default form submission to avoid page reload

    if (!file) {
      setMessage({ text: "Veuillez sélectionner un fichier.", variant: "error" });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    
    try {
      const response = await ExcelApi.importExcel(file, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgress(percentCompleted);
      });

      setMessage({ 
        text: response.data.message || "Fichier importé avec succès !", 
        variant: "success" 
      });
      
      // Reset form but do not redirect
      setFile(null);
      setProgress(0);
      document.getElementById("formFile").value = ""; // Clear file input

    } catch (error) {
      handleUploadError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadError = (error) => {
    let errorMessage = "Erreur lors de l'importation du fichier";

    if (error.response) {
      errorMessage += `: ${error.response.data.message ||
        error.response.data.error ||
        error.response.statusText}`;
    } else if (error.request) {
      errorMessage += ": Pas de réponse du serveur";
    } else {
      errorMessage += `: ${error.message}`;
    }

    setMessage({
      text: errorMessage,
      variant: "error",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-black p-6 border-[#64FF07] border-2 rounded-lg shadow-lg">
        <h2 className="special-font text-5xl text-center mb-6 text-black dark:text-gray-100">
          <b>Importer des données Excel</b>
        </h2>

        <form className="space-y-4" onSubmit={handleUpload}>
          <div>
            <label
              htmlFor="formFile"
              className="block text-sm text-black dark:text-gray-100 mb-2"
            >
              Sélectionnez un fichier Excel
            </label>
            <input
              type="file"
              id="formFile"
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
              className="block w-full text-sm text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-black hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-100 dark:hover:file:bg-gray-600"
            />
          </div>

          {/* Progress bar */}
          {isLoading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          <Button
            id="upload-button"
            title={isLoading ? `Import en cours... ${progress}%` : "Importer le fichier"}
            onClick={handleUpload}
            leftIcon={<TiLocationArrow className={isLoading ? "animate-spin" : ""} />}
            containerClass="flex-center gap-2 w-full"
            className={`w-full justify-center ${isLoading ? "opacity-75" : ""}`}
            disabled={isLoading || !file}
          />
        </form>

        {message.text && (
          <div
            className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium ${
              message.variant === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100"
                : "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportData;