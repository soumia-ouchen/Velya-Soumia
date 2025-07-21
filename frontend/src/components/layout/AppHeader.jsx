import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useSidebar } from "./SidebarContext";
import UserDropdown from "./UserDropdown";

const AppHeader = (
  { user,onLogout }) => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const [searchTerm, setSearchTerm] = useState('');


  const handleToggle = () => {

    if (window.innerWidth >= 714) {
      toggleSidebar();
    } else {
      // If the sidebar is open, close it
      if (isMobileOpen) {
        toggleMobileSidebar();
        console.log("Closing mobile sidebar");// ne fonctionne pas
      } else {
        // If the sidebar is closed, open it
        toggleMobileSidebar();
        console.log("Opening mobile sidebar"); // ne fonctionne pas
      }
    }
    toggleMobileSidebar();

    console.log("isMobileOpen after toggle:", isMobileOpen);
  };


  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 flex w-full bg-gray-50 border-gray-50 z-99999 dark:border-black dark:bg-black lg:border-b">
      <div className="flex flex-col items-center justify-between flex-grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-[#6df901] sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="items-center justify-center w-10 h-10 text-[#64FF07] border-[#64FF07] rounded-lg z-99999 dark:border-[#64FF07] lg:flex dark:text-[#64FF07] lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg width="16" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          <Link to="/" className="lg:hidden">
            <img className="dark:hidden" src="./img/LogoVelyaModeClair.png" alt="Logo" />
            <img className="hidden dark:block" src="./img/logosDark.svg" alt="Logo" />
          </Link>

          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-99999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {/* Partie droite de l'en-tête */}
        <div className="flex items-center justify-between w-full px-4 py-2 lg:justify-end lg:py-0">
          {/* Barre de recherche */}
          <div className="hidden lg:block lg:mr-4 relative w-64">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search (Ctrl+K)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 text-sm border rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#64FF07] focus:border-transparent"
              aria-label="Search"
            />
            <kbd className="absolute right-2 top-2 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded dark:bg-gray-700 dark:text-gray-300">
              ⌘K
            </kbd>
          </div>


          {/* Bouton thème */}
          <button
  onClick={() => {
    document.documentElement.classList.toggle("dark");
  }}
  className="inline-flex items-center justify-center transition-colors rounded-full w-[45px] h-[45px] bg-[#64FF07] hover:bg-[#64FF07] overflow-visible"
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


          {/* Notifications 
          <NotificationDropdown />*/}

          {/* Utilisateur */}

          {user ? ( <UserDropdown user={user} onLogout={onLogout} />
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;