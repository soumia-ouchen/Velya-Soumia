import fs from 'fs';

export const cleanUpFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) console.error("Erreur suppression fichier temporaire:", err);
        });
    }
};