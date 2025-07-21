import "../../../AutoSlide.css";
const AutoSlide = () => {
  return (
    <main>
      {/* Première section avec du texte défilant */}
      <div className="slider" style={{ "--width": "90px", "--height": "90px", "--quantity": 10 }}>
        <div className="list">
          <div className="scroll-container">
            <div className="scroll-text">
              {[
                "Gagnez du temps",
                "Répondez automatiquement",
                "Boostez vos ventes",
                "Support intelligent",
                "Service instantané",
                "Disponible 24/7",
                "Zéro attente",
                "Expérience client fluide",
                "Assistant IA puissant",
                "Simplifiez votre business",
              ].map((text, index) => (
                <span key={index}>{text}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Deuxième section avec des images */}
      <div className="slider"  style={{ "--width": "150px", "--height": "150px", "--quantity": 9 }}>
        <div className="list">
          {["1.png", "GREEN.png", "V.png", "E.png", "L.png", "Y.png", "A.png", "GREEN.png", "0.png"].map((img, index) => (
            <div className="item" key={index} style={{ "--position": index + 1 }}>
                      <img src={`/images/${img}`} alt="" />

            </div>
          ))}
        </div>
      </div>

      {/* Deuxième section de texte défilant */}
      <div className="scroll-container">
        <div className="scroll-text">
          {[
            "Gagnez du temps",
            "Répondez automatiquement",
            "Boostez vos ventes",
            "Support intelligent",
            "Service instantané",
            "Disponible 24/7",
            "Zéro attente",
            "Expérience client fluide",
            "Assistant IA puissant",
            "Simplifiez votre business",
          ].map((text, index) => (
            <span key={index}>{text}</span>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AutoSlide; 