import { useTheme } from "../common/themeContext";

export default function AuthLayout({ children }) {
  const { toggleTheme } = useTheme();

  return (
    
    <div className="relative p-6 bg-gray-50 z-1 dark:bg-black sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-black sm:p-0">
        {children}

        <div className="relative items-center hidden w-full h-full lg:w-1/2  bg-brand-950 dark:bg-black lg:grid">
            
            
  <video
    className="h-full object-cover"
    src="/videos/BgAuth.mp4"
    autoPlay
    loop
    muted
  ></video>

        </div>

        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center transition-colors rounded-full w-[70px] h-[70px] bg-[#64FF07] hover:bg-[#64FF07] overflow-visible"
          >
            <img
              src="/icons/icon-dark.svg"
              alt="Icône mode sombre"
              className="hidden dark:block w-6 h-6"
            />
            <img
              src="/icons/icon-light.svg"
              alt="Icône mode clair"
              className="dark:hidden w-6 h-6"
            />
          </button>
        </div>
        
      </div>
    </div>
  );
}
