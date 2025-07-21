import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiChevronDown,
  FiGrid,
  FiList,
  FiFileText,
  FiSettings,
  FiDatabase,
  FiMoreHorizontal
} from "react-icons/fi";
import { useSidebar } from "./SidebarContext";
import "../../index.css";

/**
 * Tableau des éléments de navigation principaux
 * Chaque élément contient :
 * - icon: Icône à afficher
 * - name: Nom de l'élément
 * - subItems: Sous-éléments avec leur nom et chemin
 */
const navItems = [
  {
    icon: <FiGrid />,
    name: "Dashboard",
    subItems: [
      { name: "Statistiques", path: "/home" },
    ],
  },
  {
    name: "Importer Data",
    icon: <FiList />,
    subItems: [
      { name: "Exel", path: "/Importdata" },
      { name: "List", path: "/ListOrdersPage" }
    ],
  },
  {
    icon: <FiGrid />,
    name: "WhatsApp",
    subItems: [{ name: "connecter", path: "/whatsapp" }],
  },
  {
    name: "Gestion des Produits",
    icon: <FiDatabase />,
    subItems: [
      { name: "cree produit", path: "/createProduct" },
      { name: "List produit", path: "/produit" },
    ],
  },
  {
    name: "Creation des Offres",
    icon: <FiFileText />,
    subItems: [
      { name: "cree une offre", path: "/createOffer" },
      { name: "List offre", path: "/offersListPage" },
    ],
  },
  {
    name: "Gestion des Messages",
    icon: <FiFileText />,
    subItems: [
      { name: "Message", path: "/createMessages" },
      { name: "Message deja definit", path: "/messagesListPage" },
    ],
  },
  {
    name: "FaqManager",
    icon: <FiFileText />,
    subItems: [
      { name: "FaqManager", path: "/faq" },
    ],
  },
];

/**
 * Tableau des éléments de navigation secondaires (autres)
 */
const othersItems = [
  {
    icon: <FiSettings />,
    name: "paramaitre",
    subItems: [
      { name: "profile", path: "/profile" },
    ],
  },
];

/**
 * Composant Sidebar principal
 * Gère l'affichage et l'interaction avec la barre latérale
 */
function AppSidebar() {
  // Récupération des états et fonctions du contexte Sidebar
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  // États pour gérer les sous-menus ouverts et leur hauteur
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  /**
   * Vérifie si un chemin est actif (correspond à l'URL actuelle)
   * @param {string} path - Chemin à vérifier
   * @returns {boolean} True si le chemin est actif
   */
  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  // Effet pour ouvrir automatiquement le sous-menu correspondant à la route actuelle
  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        nav.subItems?.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({ type: menuType, index });
            submenuMatched = true;
          }
        });
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  // Effet pour calculer la hauteur des sous-menus ouverts
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  /**
   * Gère l'ouverture/fermeture des sous-menus
   * @param {number} index - Index de l'élément de menu
   * @param {string} menuType - Type de menu ('main' ou 'others')
   */
  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prev) =>
      prev && prev.type === menuType && prev.index === index
        ? null
        : { type: menuType, index }
    );
  };

  /**
   * Rend les éléments de menu
   * @param {Array} items - Tableau d'éléments de menu à rendre
   * @param {string} menuType - Type de menu ('main' ou 'others')
   * @returns {JSX.Element} Éléments de menu rendus
   */
  const renderMenuItems = (items, menuType) => (
    <ul className="flex flex-col gap-4 bg-gray-50 dark:bg-black rounded-lg p-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            // Bouton pour les éléments avec sous-menu
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group flex items-center w-full ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span className="menu-item-icon-size">{nav.icon}</span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="flex items-center justify-between flex-1 ml-2">
                  <span className="menu-item-text">{nav.name}</span>
                  <FiChevronDown
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                        openSubmenu?.index === index
                        ? "rotate-180 text-brand-500"
                        : ""
                      }`}
                  />
                </span>
              )}
            </button>
          ) : (
              // Lien pour les éléments sans sous-menu
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path)
                    ? "menu-item-active"
                    : "menu-item-inactive"
                }`}
              >
                <span className="menu-item-icon-size">{nav.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}

          {/* Sous-menu */}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => (subMenuRefs.current[`${menuType}-${index}`] = el)}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType &&
                  openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-gray-50 dark:bg-black dark:border-black text-black dark:text-white h-screen transition-all duration-300 ease-in-out z-50 
      ${
        isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
          ? "w-[290px]"
          : "w-[90px]"
      }
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/img/LogoVelyaModeClair.png"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/img/logos.png"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/img/logos.png"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      {/* Contenu de la sidebar */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {/* Menu principal */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-[#64FF07] ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <FiMoreHorizontal className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            {/* Autres menus */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-[#64FF07] ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Autres" : ""}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}

export default AppSidebar;