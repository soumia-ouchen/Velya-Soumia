import { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  // Regroupement de l'état de la sidebar dans un seul objet
  const [sidebarState, setSidebarState] = useState({
    isExpanded: true,
    isMobileOpen: false,
    isMobile: false,
    isHovered: false,
    activeItem: null,
    openSubmenu: null,
  });

  // Fonction pour mettre à jour une propriété spécifique de l'état
  const setSidebarStateProperty = (property, value) => {
    setSidebarState((prevState) => ({
      ...prevState,
      [property]: value,
    }));
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setSidebarStateProperty("isMobile", mobile);

      if (!mobile) {
        setSidebarStateProperty("isMobileOpen", false); // Fermer la sidebar mobile lors du passage à une taille plus grande
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Fonctions pour gérer la sidebar et les sous-menus
  const toggleSidebar = () => {
    setSidebarStateProperty("isExpanded", (prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setSidebarStateProperty("isMobileOpen", (prev) => !prev);
  };

  const toggleSubmenu = (item) => {
    setSidebarStateProperty("openSubmenu", (prev) => (prev === item ? null : item));
  };

  return (
    <SidebarContext.Provider
      value={{
        // Utilisation des états regroupés
        isExpanded: sidebarState.isMobile ? false : sidebarState.isExpanded,
        isMobileOpen: sidebarState.isMobileOpen,
        isHovered: sidebarState.isHovered,
        activeItem: sidebarState.activeItem,
        openSubmenu: sidebarState.openSubmenu,
        toggleSidebar,
        toggleMobileSidebar,
        setIsHovered: (hovered) => setSidebarStateProperty("isHovered", hovered),
        setActiveItem: (item) => setSidebarStateProperty("activeItem", item),
        toggleSubmenu,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
