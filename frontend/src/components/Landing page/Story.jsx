import gsap from "gsap";
import { useRef } from "react";

import Button from "../common/Button";
import AnimatedTitle from "./ui/AnimatedTitle";
import { useNavigate } from "react-router-dom";

const FloatingImage = () => {
  const navigate = useNavigate(); // Hook pour la navigation
  const frameRef = useRef(null);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const element = frameRef.current;

    if (!element) return;

    const rect = element.getBoundingClientRect();
    const xPos = clientX - rect.left;
    const yPos = clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((yPos - centerY) / centerY) * -10;
    const rotateY = ((xPos - centerX) / centerX) * 10;

    gsap.to(element, {
      duration: 0.3,
      rotateX,
      rotateY,
      transformPerspective: 500,
      ease: "power1.inOut",
    });
  };

  const handleMouseLeave = () => {
    const element = frameRef.current;

    if (element) {
      gsap.to(element, {
        duration: 0.3,
        rotateX: 0,
        rotateY: 0,
        ease: "power1.inOut",
      });
    }
  };

  const slider = () => {
    navigate("/Slider"); 
  };

  return (
    <div id="comment-a-marche-" className="min-h-screen w-screen bg-black text-blue-50">
      <div className="flex size-full flex-col items-center py-10 pb-24">
        <p className="font-general text-sm uppercase md:text-[10px]">
        Vous vous posez des questions ? On y répond !
        </p>

        <div className="relative size-full">
          <AnimatedTitle
            title="<b>Vos Questions?</b><br /><b>Nos Reponses!</b>"
            containerClass="mt-5 pointer-events-none mix-blend-difference relative z-10"
          />

          <div className="story-img-container">
            <div className="story-img-mask">
              <div className="story-img-content">
              <video
                  ref={frameRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseLeave}
                  onMouseEnter={handleMouseLeave}
                  className="object-contain"
                  autoPlay
                  loop
                  muted
                >
                  <source src="/videos/VosQstETNosRep.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

            {/* for the rounded corner */}
            <svg
              className="invisible absolute size-0"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="flt_tag">
                  <feGaussianBlur
                    in="SourceGraphic"
                    stdDeviation="8"
                    result="blur"
                  />
                  <feColorMatrix
                    in="blur"
                    mode="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                    result="flt_tag"
                  />
                  <feComposite
                    in="SourceGraphic"
                    in2="flt_tag"
                    operator="atop"
                  />
                </filter>
              </defs>
            </svg>
          </div>
        </div>

        <div className="-mt-80 flex w-full justify-center md:-mt-64 md:me-44 md:justify-end">
          <div className="flex h-full w-fit flex-col items-center md:items-start">
            <p className="mt-10 max-w-sm text-center font-circular-web text-violet-50 md:text-start">
            Avant de vous lancer avec VELYA, il est normal de vouloir tout comprendre.
             Que vous soyez une petite boutique ou une grande entreprise,
              cette section répond aux interrogations les plus fréquentes sur notre solution.
               Découvrez à qui s’adresse VELYA, comment il fonctionne,
                ce qu’il peut faire pour vous… et pourquoi il pourrait bien devenir votre nouvel 
                allié pour booster vos ventes et automatiser votre service client !


            </p>

            <Button
              id="realm-btn"
              title="dicovrire VELYA"
              containerClass="mt-5"
              onClick={slider}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingImage;
