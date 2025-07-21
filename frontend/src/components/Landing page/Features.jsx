import { useState, useRef } from "react";
import { TiLocationArrow } from "react-icons/ti";
import AutoSlide from "./ui/auto-slide";
import Shapes from "./ui/Shapes";
import AnimatedTitle from "./ui/AnimatedTitle";
export const BentoTilt = ({ children, className = "" }) => {
  const [transformStyle, setTransformStyle] = useState("");
  const itemRef = useRef(null);

  const handleMouseMove = (event) => {
    if (!itemRef.current) return;

    const { left, top, width, height } =
      itemRef.current.getBoundingClientRect();

    const relativeX = (event.clientX - left) / width;
    const relativeY = (event.clientY - top) / height;

    const tiltX = (relativeY - 0.5) * 5;
    const tiltY = (relativeX - 0.5) * -5;

    const newTransform = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(.95, .95, .95)`;
    setTransformStyle(newTransform);
  };

  const handleMouseLeave = () => {
    setTransformStyle("");
  };

  return (
    <div
      id="Features"
      ref={itemRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: transformStyle }}
    >
      {children}
    </div>
  );
};

export const BentoCard = ({ src, title, description }) => {


  return (
    <div className="relative size-full">
      <video
        src={src}
        loop
        muted
        autoPlay
        className="absolute left-0 top-0 size-full object-cover object-center"
      />
      <div className="relative z-10 flex size-full flex-col justify-between p-5 text-blue-50">
        <div>
          <h1 className="bento-title special-font">{title}</h1>
          {description && (
            <p className="mt-3 max-w-64 text-xs md:text-base">{description}</p>
          )}
        </div>

      </div>
    </div>
  );
};

const Features = () => (
  <section className="bg-black pb-1">
    <AutoSlide />
    <div className="container mx-auto px-1 md:px-1">
    <div className="flex flex-col items-center justify-between gap-10 px-5 py-7 md:flex-row md:items-start">
  {/* Section texte */}
  <div className="flex flex-col justify-center md:w-1/2">
    <p className="font-circular-web text-lg text-blue-50">
      Simplifiez votre relation client dès aujourd’hui avec VELYA!
    </p>
    <p className="mt-4 max-w-md font-circular-web text-lg text-blue-50 opacity-50">
      VELYA est une solution de chatbot intelligente qui aide les entreprises à automatiser 
      et personnaliser leur service client. Grâce à son intégration avec WhatsApp, 
      elle permet de gérer facilement les interactions avec les clients, 
      en assurant un suivi précis des commandes et une communication en temps réel.
      Velya analyse les données clients, automatise les réponses et envoie des messages 
      personnalisés basés sur les préférences et le statut des commandes. Cela permet 
      non seulement de gagner du temps et de réduire la charge de travail, 
      mais aussi d’améliorer la satisfaction client et d’augmenter les conversions. 
      Grâce à cette approche intelligente, Velya offre une gestion fluide et efficace 
      des relations clients, idéale pour les entreprises cherchant à optimiser leur 
      service client et leurs ventes.
    </p>
  </div>

  {/* Section shapes */}
  <div className="flex justify-center md:w-1/2 md:justify-end">
    <div className="w-full md:max-w-[700px]">
      <Shapes />
    </div>
  </div>
</div>

  <div className="container mx-auto px-3 md:mt-10 md:px-3">
      {/* Ajouter le titre animé ici */}
        <div id="fonctionnalits-cls" className="mt-20 text-center ">
        <AnimatedTitle
          title="Fonctionnalités Clés"
          containerClass="mt-5 text-white text-3xl md:text-7xl pb-[60px]"
        />
      </div>
</div>
      {/* BentoTilt for Card 1 */}
      <BentoTilt className="border-hsla relative mb-7 h-96 w-full overflow-hidden rounded-md md:h-[65vh]">
        <BentoCard
          src="videos/WAT.mp4"
          title={<><b>Integration WhatsApp</b>&<b>Chatbot Intelligent</b></>}
          description="Connectez votre entreprise à WhatsApp grâce à un chatbot intelligent. Il répond automatiquement aux questions des clients et envoie des messages pour les tenir informés du suivi de leur commande."
          isComingSoon
        />
      </BentoTilt>
      
      <div className="grid h-[180vh] w-full grid-cols-2 grid-rows-3 gap-7">
        {/* BentoTilt for Card 2 */}
        <BentoTilt className="bento-tilt_1 row-span-1 md:col-span-1 md:row-span-2">
          <BentoCard
            src="videos/CLIENT.mp4"
            title={<><b>Contact</b>Client<b></b></>}
            description=" Chaque utilisateur peut poser ses questions,
              suivre ses demandes et rester informé à chaque étape du service, ce qui garantit une meilleure satisfaction client."
            isComingSoon
          />
        </BentoTilt>

        {/* BentoTilt for Card 3 */}
       <BentoTilt className="bento-tilt_1 row-span-1 ms-32 md:col-span-1 md:ms-0">
          <BentoCard
            src="videos/volume.mp4"
            title={<><b>Compr</b>é<b>hension avanc</b>é<b>e</b> <b>grace </b>à <b>l’IA</b></>}
            description="Propulsé par 300 modèles LLM, notre chatbot offre des réponses fluides, pertinentes et contextuelles pour une expérience utilisateur optimale."
          />
        </BentoTilt>

        {/* BentoTilt for Card 4 */}
        <BentoTilt className="bento-tilt_1 me-14 md:col-span-1 md:me-0">
          <BentoCard
            src="videos/ClientSat.mp4"
            title={<><b>Satisfaction</b></>}
            description="L’application fournit des statistiques claires sur la satisfaction des clients. Elle affiche le nombre total de clients satisfaits, les retours positifs reçus"
            isComingSoon
          />
        </BentoTilt>

        {/* BentoTilt for More Coming Soon */}
        <BentoTilt className="bento-tilt_2 row-span-1">
          <div className="flex size-full flex-col justify-between bg-[#64FF07] p-5">
            <h1 className="bento-title special-font max-w-64 text-black">
              M<b>o</b>re co<b>m</b>ing s<b>o</b>on.
            </h1>

            <TiLocationArrow className="m-5 scale-[5] self-end" />
          </div>
        </BentoTilt>

        {/* BentoTilt for Card 5 */}
  <BentoTilt className="bento-tilt_2 border-hsla row-span-1">
  <div className="relative size-full">
    <video
      src="videos/Statistique.mp4"
      loop
      muted
      autoPlay
      className="absolute left-0 top-0 size-full object-cover object-center"
    />
    <BentoCard
      title={<b>Statistiques Live</b>}
      description="Accédez en un coup d’œil à toutes les données importantes"
      isComingSoon
    />
  </div>
</BentoTilt>
        
        
      </div>
      <BentoTilt className="border-hsla relative mb-9 mt-10 h-96 w-full overflow-hidden rounded-md md:h-[65vh]">
        <BentoCard
          src="videos/vente.mp4"
          title={<b>Boost Ventes</b>}
          description="vos ventes augmentent naturellement grâce à une meilleure communication avec les clients, 
          des campagnes marketing automatisées et un suivi personnalisé. Chaque interaction est
           optimisée pour convertir davantage, fidéliser vos clients et maximiser vos profits."
          isComingSoon
        />
      </BentoTilt>
      <div className="mt-10 grid grid-cols-1 gap-7 md:grid-cols-2">
      <BentoTilt className="bento-tilt_2 border-hsla row-span-1">
    <div className="relative size-full">
      <video
        src="videos/questionRep.mp4"
        loop
        muted
        autoPlay
        className="absolute left-0 top-0 size-full object-cover object-center"
      />
      <BentoCard
        title={<b>Base de Connaissances</b>}
        description="L’admin peut ajouter des questions et réponses que
         le chatbot utilise pour mieux répondre aux clients.
          Cela rend les échanges plus rapides, précis et adaptés aux besoins."
        isComingSoon
      />
    </div>
  </BentoTilt>
  <BentoTilt className="bento-tilt_2 border-hsla row-span-1">
    <div className="flex size-full flex-col justify-between bg-[#64FF07] p-5">
      <h1 className="bento-title special-font max-w-64 text-black">
        <b>Support</b> Client 24/7
      </h1>
      <TiLocationArrow className="m-5 scale-[5] self-end text-black" />
    </div>
  </BentoTilt>

  
</div>
    </div>
  </section>
);

export default Features;
