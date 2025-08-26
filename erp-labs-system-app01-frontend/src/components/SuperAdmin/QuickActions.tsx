import { CompanyIcon, LockIcon, UsersIcon, PlugInIcon } from "../../icons";

export default function QuickActions() {
  const actions = [
    {
      icon: CompanyIcon,
      title: "Nouvelle Compagnie",
      description: "Créer une nouvelle entreprise",
      color: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      href: "/superadmin/companies/new"
    },
    {
      icon: LockIcon,
      title: "Gérer Permissions",
      description: "Configurer les droits d'accès",
      color: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      href: "/superadmin/permissions"
    },
    {
      icon: UsersIcon,
      title: "Gérer Compagnies",
      description: "Voir et modifier les entreprises",
      color: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      href: "/superadmin/companies"
    },
    {
      icon: PlugInIcon,
      title: "Configuration",
      description: "Paramètres du système",
      color: "bg-orange-100 dark:bg-orange-900/20",
      iconColor: "text-orange-600 dark:text-orange-400",
      href: "/superadmin/settings"
    }
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Actions Rapides</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Accès rapide aux fonctionnalités principales
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            className="group p-4 border border-gray-200 rounded-xl dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200 text-left"
            onClick={() => {
              // Navigation sera implémentée plus tard
              console.log(`Navigation vers: ${action.href}`);
            }}
          >
            <div className={`flex items-center justify-center w-12 h-12 ${action.color} rounded-xl mb-3 group-hover:scale-110 transition-transform duration-200`}>
              <action.icon className={`w-6 h-6 ${action.iconColor}`} />
            </div>
            
            <h4 className="font-medium text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {action.title}
            </h4>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
              {action.description}
            </p>
            
            <div className="mt-3 flex items-center text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Cliquer pour accéder →
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ces actions vous permettent de gérer rapidement le système
          </p>
        </div>
      </div>
    </div>
  );
}
