import { useState } from "react";
import { UsersIcon, UserCircleIcon } from "../../icons";

interface Role {
  id: number;
  name: string;
  permissions: string[];
  userCount: number;
}

const sampleRoles: Role[] = [
  {
    id: 1,
    name: "Super Administrateur",
    permissions: ["Toutes les permissions"],
    userCount: 1
  },
  {
    id: 2,
    name: "Administrateur",
    permissions: ["Gestion des utilisateurs", "Gestion des rôles", "Rapports"],
    userCount: 3
  },
  {
    id: 3,
    name: "Technicien de Laboratoire",
    permissions: ["Lecture patients", "Écriture examens", "Lecture stocks"],
    userCount: 8
  },
  {
    id: 4,
    name: "Réceptionniste",
    permissions: ["Lecture patients", "Écriture patients", "Lecture examens"],
    userCount: 5
  },
  {
    id: 5,
    name: "Comptable",
    permissions: ["Lecture factures", "Écriture factures", "Rapports financiers"],
    userCount: 2
  }
];

export default function RolePermissionsCard() {
  const [roles] = useState<Role[]>(sampleRoles);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
          <UserCircleIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Rôles & Permissions
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Vue d'ensemble des rôles
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-black dark:text-white">
                {role.name}
              </h4>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <UsersIcon className="h-4 w-4" />
                <span>{role.userCount} utilisateur(s)</span>
              </div>
            </div>
            
            <div className="space-y-2">
              {role.permissions.map((permission, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  <span>{permission}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-3 flex gap-2">
              <button className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Modifier
              </button>
              <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                Voir détails
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-black dark:text-white">
              {roles.length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Rôles actifs
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-black dark:text-white">
              {roles.reduce((acc, role) => acc + role.userCount, 0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Utilisateurs total
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 