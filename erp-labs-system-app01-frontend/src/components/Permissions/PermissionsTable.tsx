import { useState } from "react";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";

interface Permission {
  id: number;
  code: string;
  action: string;
  module: string;
}

const samplePermissions: Permission[] = [
  {
    id: 1,
    code: "PAT_READ",
    action: "READ",
    module: "Patients"
  },
  {
    id: 2,
    code: "PAT_CREATE",
    action: "CREATE",
    module: "Patients"
  },
  {
    id: 3,
    code: "PAT_UPDATE",
    action: "UPDATE",
    module: "Patients"
  },
  {
    id: 4,
    code: "PAT_DELETE",
    action: "DELETE",
    module: "Patients"
  },
  {
    id: 5,
    code: "EXAM_READ",
    action: "READ",
    module: "Examens"
  },
  {
    id: 6,
    code: "EXAM_CREATE",
    action: "CREATE",
    module: "Examens"
  },
  {
    id: 7,
    code: "EXAM_UPDATE",
    action: "UPDATE",
    module: "Examens"
  },
  {
    id: 8,
    code: "EXAM_DELETE",
    action: "DELETE",
    module: "Examens"
  },
  {
    id: 9,
    code: "STOCK_READ",
    action: "READ",
    module: "Stocks"
  },
  {
    id: 10,
    code: "STOCK_CREATE",
    action: "CREATE",
    module: "Stocks"
  },
  {
    id: 11,
    code: "STOCK_UPDATE",
    action: "UPDATE",
    module: "Stocks"
  },
  {
    id: 12,
    code: "STOCK_DELETE",
    action: "DELETE",
    module: "Stocks"
  },
  {
    id: 13,
    code: "FACT_READ",
    action: "READ",
    module: "Factures"
  },
  {
    id: 14,
    code: "FACT_CREATE",
    action: "CREATE",
    module: "Factures"
  },
  {
    id: 15,
    code: "FACT_UPDATE",
    action: "UPDATE",
    module: "Factures"
  },
  {
    id: 16,
    code: "FACT_DELETE",
    action: "DELETE",
    module: "Factures"
  }
];

const getActionColor = (action: string) => {
  switch (action) {
    case "READ":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    case "CREATE":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "UPDATE":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    case "DELETE":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  }
};

export default function PermissionsTable() {
  const [permissions] = useState<Permission[]>(samplePermissions);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Permissions Système
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestion des permissions par module et action
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90">
          <PlusIcon className="h-4 w-4" />
          Nouvelle Permission
        </button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-stroke dark:border-strokedark">
              <th className="py-3 px-4 text-left text-sm font-medium text-black dark:text-white">
                Code
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-black dark:text-white">
                Action
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-black dark:text-white">
                Module
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission) => (
              <tr
                key={permission.id}
                className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="py-3 px-4 text-sm text-black dark:text-white">
                  {permission.code}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getActionColor(permission.action)}`}>
                    {permission.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-black dark:text-white">
                  {permission.module}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-300 bg-white text-red-600 hover:bg-red-50 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20">
                      <TrashBinIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 