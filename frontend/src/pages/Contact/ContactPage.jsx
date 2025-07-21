import ContactForm from "../../components/Contact/ContactForm";
import AnimatedTitle from "../../components/Landing page/ui/AnimatedTitle";

const ImageClipBox = ({ src, clipClass }) => (
  <div className={clipClass}>
    <img src={src} alt="Decoration" />
  </div>
);

const ContactPage = () => {


  return (
    <div className="min-h-screen w-screen bg-black py-20 px-10">

      <div className="relative rounded-lg bg-black py-24 text-blue-50 sm:overflow-hidden">
        <div className="absolute -left-0 top-10 hidden h-full w-72 overflow-hidden sm:block lg:left-0 lg:w-90">
          <ImageClipBox
            src="/img/flower3D.png"
          />
        </div>

        <div className="absolute -top-40 left-0 w-60 sm:top-1/2 md:left-auto md:right-0 lg:top-20 lg:w-60">
          <ImageClipBox
            src="/img/3Dcoeur.png"
          />
        </div>

        <div className="flex flex-col items-center text-center">

          <AnimatedTitle
            title="<b>Envoyez-nous</b><br /><b>Votre Message</b>"
            className="special-font !md:text-[6.2rem] w-full font-zentry !text-5xl !font-black !leading-[.9]"
          />

          <div className="w-full max-w-2xl mt-10">
            <ContactForm />
          </div>


        </div>
      </div>
    </div>
  );
};

export default ContactPage;