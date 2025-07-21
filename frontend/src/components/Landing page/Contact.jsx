import AnimatedTitle from "./ui/AnimatedTitle";
import Button from "../common/Button";
import { useNavigate } from "react-router-dom";


const ImageClipBox = ({ src, clipClass }) => (
  <div className={clipClass}>
    <img src={src} />
  </div>
);

const Contact = () => {
  const navigate = useNavigate(); // Hook pour la navigation

  const handleClick = () => {
    navigate("/contact"); // Redirige vers la route définie

  };
  return (
    <div id="contact" className="my-20 min-h-96 w-screen  px-10">
      <div className="relative rounded-lg bg-black py-24 text-blue-50 sm:overflow-hidden">
        <div className="absolute -left-20 top-0 hidden h-full w-72 overflow-hidden sm:block lg:left-20 lg:w-96">
          
          <ImageClipBox
            src="/img/flower3D.png"
          />
        </div>

        <div className="absolute -top-40 left-20 w-60 sm:top-1/2 md:left-auto md:right-10 lg:top-20 lg:w-80">
          
          <ImageClipBox
            src="/img/3Dcoeur.png"
           
          />
        </div>

        <div className="flex flex-col items-center text-center">
          <p className="mb-10 font-general text-[10px] uppercase">
          Prenez Contact avec Nous
          </p>

          <AnimatedTitle
            title="<b>Contactez</b>-<b>Nous</b><br />pour<br /><b>Transformer Votre Service</b><b>client</b> "
            className="special-font !md:text-[6.2rem] w-full font-zentry !text-5xl !font-black !leading-[.9]"
          />

<Button
            title="contact us"
            containerClass="mt-10 cursor-pointer"
            onClick={handleClick}
          />        </div>
      </div>
    </div>
  );
};

export default Contact;
