import { useState, useEffect, useRef } from "react";

const itemsData = [
  {
    image: "/img/logosDark.png", // Chemin de l'image
    title: <b>VELYA peut-il gérer plusieurs clients en même temps ?</b>,
    description:
      "Oui, VELYA gère des centaines de conversations en parallèle via WhatsApp, tout en maintenant un suivi précis pour chaque client.",
  },
  {
    image: "/img/logosDark.png",
    title: "Est-ce que VELYA fonctionne en plusieurs langues ?",
    description:
      "Oui, VELYA est multilingue et peut répondre automatiquement dans la langue du client grâce à son moteur d’intelligence artificielle intégré.",
  },
  {
    image: "/img/logosDark.png",
    title: "Qu’est-ce que VELYA ?",
    description:
      "VELYA est une solution intelligente tout-en-un qui automatise le service client via un chatbot connecté à WhatsApp, tout en offrant une gestion complète des produits, commandes, promotions et interactions personnalisées avec les clients.",
  },
  {
    image: "/img/logosDark.png",
    title: "Comment VELYA s’intègre-t-il à WhatsApp ?",
    description:
      "VELYA vous fournit une interface dédiée dans laquelle vous générez un QR code unique. Il vous suffit de le scanner avec le compte WhatsApp Business de votre entreprise, et le numéro lié à ce compte devient automatiquement connecté au chatbot VELYA pour gérer les conversations clients.",
  },
  {
    image: "/img/logosDark.png",
    title: "VELYA peut-il répondre aux questions fréquentes des clients ?",
    description:
      "Oui, grâce à une base de connaissances personnalisable, l’admin peut ajouter toutes les questions/réponses utiles. Le chatbot VELYA utilise ensuite cette base pour fournir des réponses rapides, précises et adaptées.",
  },
  {
    image: "/img/logosDark.png",
    title: " Puis-je importer mes commandes et produits ?",
    description:
      "Oui, VELYA vous permet d’importer facilement les données de votre entreprise : produits, commandes, statuts, etc. Ces informations sont utilisées par le chatbot pour informer vos clients automatiquement sur l’état de leur commande ou proposer des offres ciblées.",
  },
  {
    image: "/img/logosDark.png",
    title: "VELYA propose-t-il des messages personnalisés ?",
    description:
      "Oui, VELYA analyse les préférences et comportements de vos clients pour leur envoyer des messages personnalisés : offres spéciales, relances, promotions, nouveautés, etc. Chaque interaction est optimisée pour fidéliser et convertir.",
  },
];

export default function Slider() {
  const [activeIndex, setActiveIndex] = useState(3); // Initial active index
  const itemsRef = useRef([]);

  useEffect(() => {
    itemsRef.current = itemsRef.current.slice(0, itemsData.length);
    loadShow();
  }, [activeIndex]);

  const loadShow = () => {
    itemsRef.current.forEach((item, index) => {
      if (!item) return;

      if (index === activeIndex) {
        item.style.transform = "none";
        item.style.zIndex = "1";
        item.style.filter = "none";
        item.style.opacity = "1";
      } else {
        const distance = Math.abs(index - activeIndex);
        const direction = index < activeIndex ? -1 : 1;
        const scale = 1 - 0.2 * distance;
        const translateX = 120 * direction * distance;

        item.style.transform = `translateX(${translateX}px) scale(${scale}) perspective(16px) rotateY(${
          direction * -1
        }deg)`;
        item.style.zIndex = `-${distance}`;
        item.style.filter = "blur(5px)";
        item.style.opacity = distance > 2 ? "0" : "0.6";
      }
    });
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1 < itemsData.length ? prev + 1 : prev));
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="slider relative w-full max-w-[2000px] h-[1000px]">
        {itemsData.map((item, index) => (
          <div
            key={index}
            ref={(el) => (itemsRef.current[index] = el)}
            className={`item absolute w-[250px] h-[500px] bg-lime-400 rounded-xl p-5 transition-all duration-500 left-1/2 -translate-x-1/2 top-0 shadow-lg overflow-hidden flex flex-col justify-center text-black`}
            style={{
              zIndex: index === activeIndex ? 1 : -Math.abs(index - activeIndex),
              filter: index !== activeIndex ? 'blur(5px)' : 'none',
              opacity: Math.abs(index - activeIndex) > 2 ? 0 : (index === activeIndex ? 1 : 0.6),
              transform: index !== activeIndex ? `translateX(${120 * (index < activeIndex ? -1 : 1) * Math.abs(index - activeIndex)}px) scale(${1 - 0.2 * Math.abs(index - activeIndex)}) perspective(16px) rotateY(${(index < activeIndex ? 1 : -1) * 1}deg)` : 'none',
            }}
          >
            <div className="header relative w-full h-[220px] overflow-hidden">
              <img
                src={item.image} // Utilisation du chemin de l'image depuis itemsData
                alt={item.title}
                className="absolute top-0 left-0 w-full h-auto object-cover"
                style={{ opacity: index === activeIndex ? 1 : 0 }} // Afficher l'image de l'élément actif
              />
            </div>
            <div className="content min-h-[10px] rounded-3xl p-4 backdrop-blur-lg flex flex-col justify-center">
              <h1 className="text-lg special-font hero-headingL  mb-2 text-center">{item.title}</h1>
              <div className="des text-sm text-center special-font">{item.description}</div>
            </div>
          </div>
        ))}

        <button
          id="next"
          onClick={nextSlide}
          className="absolute right-12 top-1/2 -translate-y-1/2 text-lime-400 bg-transparent border-none text-5xl font-bold transition-opacity hover:opacity-50 focus:outline-none"
          aria-label="Next slide"
        >
          &gt;
        </button>
        <button
          id="prev"
          onClick={prevSlide}
          className="absolute left-12 top-1/2 -translate-y-1/2 text-lime-400 bg-transparent border-none text-5xl font-bold transition-opacity hover:opacity-50 focus:outline-none"
          aria-label="Previous slide"
        >
          &lt;
        </button>
      </div>
      <style>
        {`body{
          background-image:linear-gradient(to top right, #000000, #000000) ;
          min-height: 90vh;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          
        }
        .slider{
          position: relative;
          margin-top: 100px;
          max-width: 2000px; 
          height: 600px; 
          overflow: hidden;
        }

        #next{
          position: absolute;
          right: 50px;
          top: 40%;
        }
        #prev{
          position: absolute;
          left: 50px;
          top: 40%;
        }
        #prev, #next{
          color: #64FF07;
          background: none;
          border: none;
          font-size: xxx-large;
          font-family: monospace;
          font-weight: bold;
          transition: opacity 0.5s;
        }
        #prev:hover,
        #next:hover{
          opacity: 0.5;
        }


        .item {
          position: absolute;
          width: 250px;
          height: 500px;
          text-align: justify;
          background-color: #64FF07;
          border-radius: 15px;
          padding: 20px;
          transition: 0.5s;
          left: calc(50% - 125px);
          top: 0;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          z-index: 1;
        }

        .item .header {
          position: relative;
          width: 100%;
          height: 220px; /* Hauteur fixe pour stabiliser l'affichage */
          overflow: hidden; /* Empêche le débordement */
        }

        .item .header img {
          max-width: 100%;
          max-height: 100%;
          object-fit: cover;
          position: absolute;
          transition: opacity 0.5s ease, transform 0.5s ease;
          opacity: 0; /* Initialement invisible */
        }

        .item.active .header img {
          opacity: 1;
          transform: none;
        }

        .item .content{
          min-height: 10px;
          border-radius: 30px;
          backdrop-filter: blur(30px);
          color:#000000;
        }

        .item .content label{
          display: inline-block;
          border:none;
          padding:10px;
          color:#fff;
          margin: 0 10px;
        }
        .item .content label{
          background-color: #ffffff4D;
        }
        `}
      </style>
    </div>
  );
}