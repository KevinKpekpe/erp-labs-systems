import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link } from "react-router";

interface SuperAdminNotificationDropdownProps {
  onClose: () => void;
}

export default function SuperAdminNotificationDropdown({ onClose }: SuperAdminNotificationDropdownProps) {
  return (
    <Dropdown
      isOpen={true}
      onClose={onClose}
      className="absolute right-0 mt-2 flex h-[400px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200 dark:border-gray-700">
        <h5 className="text-lg font-semibold text-gray-800 dark:text-white">
          Notifications
        </h5>
        <button
          onClick={onClose}
          className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      
      <ul className="flex flex-col h-auto overflow-y-auto space-y-2">
        {/* Notification 1 */}
        <li>
          <DropdownItem
            onItemClick={onClose}
            className="flex gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Nouvelle compagnie créée
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                La compagnie "Labo Central" a été créée avec succès
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Il y a 5 minutes
              </p>
            </div>
          </DropdownItem>
        </li>

        {/* Notification 2 */}
        <li>
          <DropdownItem
            onItemClick={onClose}
            className="flex gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Permissions mises à jour
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Les permissions du module STOCK ont été modifiées
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Il y a 15 minutes
              </p>
            </div>
          </DropdownItem>
        </li>

        {/* Notification 3 */}
        <li>
          <DropdownItem
            onItemClick={onClose}
            className="flex gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Alerte système
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Une nouvelle version du système est disponible
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Il y a 1 heure
              </p>
            </div>
          </DropdownItem>
        </li>
      </ul>
      
      <div className="border-t border-gray-200 dark:border-gray-700 mt-3 pt-3">
        <Link
          to="/superadmin/notifications"
          onClick={onClose}
          className="block w-full px-4 py-2 text-sm font-medium text-center text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/40"
        >
          Voir toutes les notifications
        </Link>
      </div>
    </Dropdown>
  );
}
