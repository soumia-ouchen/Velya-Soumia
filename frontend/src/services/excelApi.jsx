import api from './api';

const ExcelApi = {
  importExcel(file, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);

      return api.post('/excel/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress && progressEvent.total) {
            onUploadProgress(progressEvent);
          }
        },
      });
    },
  };

export default ExcelApi;