// AppLayout.js
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop"; // fond semi-transparent
import AppSidebar from "./AppSidebar";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import authService from "../../services/authService"; // Service pour les appels API

const LayoutContent = ({ token, onLogout }) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Si userId est présent dans l'URL, on charge ce profil
        // Sinon, on charge le profil de l'utilisateur connecté
        const userData = userId 
          ? await authService.getUserById(token, userId)
          : await authService.getMe(token);
        
        if (!userData) {
          throw new Error('Utilisateur non trouvé');
        }
        
        setUser(userData);
      } catch (err) {
        console.error(err);
        setUser(null); // S'assurer que user est null en cas d'erreur
        onLogout?.(); // Déconnecter si erreur de récupération de l'utilisateur
      }
    };

    if (token) {
      fetchUser();
    } else {
      console.error("Token non valide ou absent");
      navigate('/login');
    }
  }, [token, navigate, userId, onLogout]);

  return (
    <div className="min-h-screen xl:flex bg-gray-50 dark:bg-black rounded-lg p-4">
      <div className="flex flex-col lg:flex-row">
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
          } ${isMobileOpen ? "ml-0" : ""}`
        }
      >
        {user ? (
          <AppHeader user={user} onLogout={onLogout} />
        ) : (
          <div className="flex items-center justify-center h-16">
            <h1 className="text-lg font-semibold">Chargement...</h1>
          </div>
        )}

        <div className="p-4 mx-auto max-w-screen-2xl md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout = ({ token, onLogout }) => {
  return (
    <SidebarProvider>
      <LayoutContent token={token} onLogout={onLogout} />
    </SidebarProvider>
  );
};

export default AppLayout;