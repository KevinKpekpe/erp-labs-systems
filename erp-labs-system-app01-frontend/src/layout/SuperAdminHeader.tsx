import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import { ChevronDownIcon, UserCircleIcon } from "../icons";
import SuperAdminUserDropdown from "../components/header/SuperAdminUserDropdown";
import SuperAdminNotificationDropdown from "../components/header/SuperAdminNotificationDropdown";

const SuperAdminHeader: React.FC = () => {
  const { state } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);

  const handleSidebarToggle = () => {
    toggleSidebar();
  };

  const handleMobileSidebarToggle = () => {
    toggleMobileSidebar();
  };

  const handleUserDropdownToggle = () => {
    setIsUserDropdownOpen((prev: boolean) => !prev);
    setIsNotificationDropdownOpen(false);
  };

  const handleNotificationDropdownToggle = () => {
    setIsNotificationDropdownOpen((prev: boolean) => !prev);
    setIsUserDropdownOpen(false);
  };

  const closeAllDropdowns = () => {
    setIsUserDropdownOpen(false);
    setIsNotificationDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between bg-white px-4 py-3 shadow-sm dark:bg-gray-900 dark:shadow-sm lg:px-6">
      <div className="flex items-center gap-3">
        {/* Bouton sidebar mobile */}
        <button
          onClick={handleMobileSidebarToggle}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 lg:hidden"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Bouton sidebar desktop */}
        <button
          onClick={handleSidebarToggle}
          className="hidden lg:inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Titre de la page */}
        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            SuperAdmin Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestion globale du système
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Toggle du thème */}
        <button
          onClick={toggleTheme}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
        >
          {theme === "dark" ? (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={handleNotificationDropdownToggle}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 relative"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM4.5 19.5L9 15m0 0V9m0 6H3"
              />
            </svg>
            {/* Badge de notification */}
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>
          
          {isNotificationDropdownOpen && (
            <SuperAdminNotificationDropdown onClose={closeAllDropdowns} />
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={handleUserDropdownToggle}
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground"
          >
            <div className="flex items-center gap-2">
              {state.user?.photo_de_profil ? (
                <img
                  src={state.user.photo_de_profil}
                  alt="Photo de profil"
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
              )}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {state.user?.name || state.user?.username || "SuperAdmin"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  SuperAdministrateur
                </p>
              </div>
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </div>
          </button>
          
          <SuperAdminUserDropdown 
            isOpen={isUserDropdownOpen} 
            onClose={closeAllDropdowns} 
          />
        </div>
      </div>
    </header>
  );
};

export default SuperAdminHeader;
