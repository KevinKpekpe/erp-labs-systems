import { Link } from "react-router";
import { BoltIcon } from "../icons";

export default function SidebarWidget() {
  return (
    <div className="mt-auto">
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500">
            <BoltIcon className="size-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-800 dark:text-white">
              ClinLab ERP Pro
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Version avancée
            </p>
          </div>
        </div>
        <div className="mt-3">
          <Link
            to="/upgrade"
            className="block w-full rounded-md bg-brand-500 px-3 py-2 text-center text-xs font-medium text-white hover:bg-brand-600"
          >
            Mettre à niveau
          </Link>
        </div>
      </div>
    </div>
  );
}
