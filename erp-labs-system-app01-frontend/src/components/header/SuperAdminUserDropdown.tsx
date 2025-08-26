import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { ENV } from "../../config/env";

interface SuperAdminUserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuperAdminUserDropdown({ isOpen, onClose }: SuperAdminUserDropdownProps) {
  const { state, logout } = useAuth();

  const backendBase = (ENV.API_BASE_URL || "").replace(/\/api\/?$/, "");
  const photoUrl = state.user?.photo_de_profil 
    ? `${backendBase}/storage/${state.user.photo_de_profil.replace(/^\/+/, '')}`
    : null;

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={onClose}
      className="absolute right-0 mt-2 flex w-[280px] flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900"
    >
      {/* En-tête du profil */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-shrink-0">
          {photoUrl ? (
            <img 
              src={photoUrl} 
              alt="Photo de profil" 
              className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" 
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {state.user?.name || state.user?.username || "SuperAdmin"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {state.user?.email || "superadmin@clinlab.com"}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            SuperAdministrateur
          </p>
        </div>
      </div>

      {/* Menu des actions */}
      <ul className="py-2 space-y-1">
        <li>
          <DropdownItem
            onItemClick={onClose}
            tag="a"
            to="/superadmin/profile"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg group hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Mon Profil
          </DropdownItem>
        </li>
        
        <li>
          <DropdownItem
            onItemClick={onClose}
            tag="a"
            to="/superadmin/settings"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg group hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Paramètres
          </DropdownItem>
        </li>

        <li>
          <DropdownItem
            onItemClick={onClose}
            tag="a"
            to="/superadmin/audit"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg group hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Audit & Logs
          </DropdownItem>
        </li>
      </ul>

      {/* Séparateur */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

      {/* Bouton de déconnexion */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg group hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 transition-colors w-full text-left"
      >
        <svg className="w-5 h-5 text-red-500 group-hover:text-red-600 dark:text-red-400 dark:group-hover:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Se déconnecter
      </button>
    </Dropdown>
  );
}
