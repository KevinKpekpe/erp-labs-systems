import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Import des icônes
import {
  GridIcon,
  ChevronDownIcon,
  HorizontaLDots,
  CompanyIcon,
  LockIcon,
  UsersIcon,
  AuditIcon,
  CalenderIcon,
  UserCircleIcon,
  PieChartIcon,
  PlugInIcon,
  ArrowLeftIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { useAuth } from "../context/AuthContext";

const debug = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.log("[SuperAdminSidebar]", ...args);
};

type PermissionReq = { action: string; module: string };

type SubNavItem = { name: string; path: string; pro?: boolean; new?: boolean; requiredPermission?: PermissionReq; requiredKind?: "company" | "superadmin" };

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  requiredPermission?: PermissionReq;
  requiredKind?: "company" | "superadmin";
  subItems?: SubNavItem[];
};

// Navigation principale - Modules SuperAdmin
const baseNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/superadmin/home",
    requiredKind: "superadmin",
  },
  {
    icon: <CompanyIcon />,
    name: "Gestion des Compagnies",
    requiredKind: "superadmin",
    subItems: [
      { name: "Liste des compagnies", path: "/superadmin/companies", requiredKind: "superadmin" },
      { name: "Nouvelle compagnie", path: "/superadmin/companies/new", requiredKind: "superadmin" },
    ],
  },
  {
    icon: <LockIcon />,
    name: "Gestion des Permissions",
    requiredKind: "superadmin",
    subItems: [
      { name: "Liste des permissions", path: "/superadmin/permissions", requiredKind: "superadmin" },
      { name: "Nouvelle permission", path: "/superadmin/permissions/create", requiredKind: "superadmin" },
    ],
  },
  {
    icon: <UsersIcon />,
    name: "Utilisateurs Système",
    requiredKind: "superadmin",
    subItems: [
      { name: "Liste des utilisateurs", path: "/superadmin/users", requiredKind: "superadmin" },
      { name: "Nouvel utilisateur", path: "/superadmin/users/new", requiredKind: "superadmin" },
    ],
  },
];

// Navigation secondaire - Administration et outils
const baseOthersItems: NavItem[] = [
  {
    icon: <AuditIcon />,
    name: "Audit & Logs",
    requiredKind: "superadmin",
    subItems: [
      { name: "Logs système", path: "/superadmin/audit/logs", requiredKind: "superadmin" },
      { name: "Traçabilité", path: "/superadmin/audit/trace", requiredKind: "superadmin" },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: "Rapports Système",
    requiredKind: "superadmin",
    subItems: [
      { name: "Statistiques globales", path: "/superadmin/reports/stats", requiredKind: "superadmin" },
      { name: "Analyses", path: "/superadmin/reports/analyses", requiredKind: "superadmin" },
      { name: "Exports", path: "/superadmin/reports/exports", requiredKind: "superadmin" },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Configuration",
    requiredKind: "superadmin",
    subItems: [
      { name: "Paramètres système", path: "/superadmin/config/system", requiredKind: "superadmin" },
      { name: "Sécurité", path: "/superadmin/config/security", requiredKind: "superadmin" },
    ],
  },
  {
    icon: <CalenderIcon />,
    name: "Calendrier",
    path: "/superadmin/calendar",
    requiredKind: "superadmin",
  },
  {
    icon: <UserCircleIcon />,
    name: "Profil SuperAdmin",
    path: "/superadmin/profile",
    requiredKind: "superadmin",
  },
  {
    icon: <ArrowLeftIcon />,
    name: "Retour Laboratoire",
    path: "/",
  },
];

const SuperAdminSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { state, hasPermission } = useAuth();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [suppressAutoOpenPath, setSuppressAutoOpenPath] = useState<string | null>(null);

  // Filtrage des éléments de navigation selon les permissions
  const navItems = useMemo(() => {
    return baseNavItems.filter((item) => {
      if (item.requiredKind && item.requiredKind !== "superadmin") return false;
      if (item.requiredPermission && !hasPermission(item.requiredPermission.action, item.requiredPermission.module)) return false;
      if (item.subItems) {
        item.subItems = item.subItems.filter((subItem) => {
          if (subItem.requiredKind && subItem.requiredKind !== "superadmin") return false;
          if (subItem.requiredPermission && !hasPermission(subItem.requiredPermission.action, subItem.requiredPermission.module)) return false;
          return true;
        });
        return item.subItems.length > 0;
      }
      return true;
    });
  }, [hasPermission]);

  const othersItems = useMemo(() => {
    return baseOthersItems.filter((item) => {
      if (item.requiredKind && item.requiredKind !== "superadmin") return false;
      if (item.requiredPermission && !hasPermission(item.requiredPermission.action, item.requiredPermission.module)) return false;
      if (item.subItems) {
        item.subItems = item.subItems.filter((subItem) => {
          if (subItem.requiredKind && subItem.requiredKind !== "superadmin") return false;
          if (subItem.requiredPermission && !hasPermission(subItem.requiredPermission.action, subItem.requiredPermission.module)) return false;
          return true;
        });
        return item.subItems.length > 0;
      }
      return true;
    });
  }, [hasPermission]);

  // Vérification si un lien est actif
  const isActive = useCallback(
    (path: string) => {
      if (suppressAutoOpenPath === path) return false;
      return location.pathname === path || location.pathname.startsWith(path + "/");
    },
    [location.pathname, suppressAutoOpenPath]
  );

  // Gestion de l'ouverture/fermeture des sous-menus
  const handleSubmenuToggle = useCallback(
    (index: number, menuType: "main" | "others") => {
      setOpenSubmenu((prev) => {
        if (prev?.type === menuType && prev?.index === index) {
          return null;
        }
        return { type: menuType, index };
      });
    },
    []
  );

  // Ouverture automatique des sous-menus lors de la navigation
  useEffect(() => {
    const shouldOpen = navItems.some((item, index) => {
      if (!item.subItems) return false;
      return item.subItems.some((subItem) => isActive(subItem.path));
    });

    if (shouldOpen) {
      const menuType = "main";
      const index = navItems.findIndex((item) => {
        if (!item.subItems) return false;
        return item.subItems.some((subItem) => isActive(subItem.path));
      });

      if (index !== -1) {
        setOpenSubmenu({ type: menuType, index });
      }
    }

    const shouldOpenOthers = othersItems.some((item, index) => {
      if (!item.subItems) return false;
      return item.subItems.some((subItem) => isActive(subItem.path));
    });

    if (shouldOpenOthers) {
      const menuType = "others";
      const index = othersItems.findIndex((item) => {
        if (!item.subItems) return false;
        return item.subItems.some((subItem) => isActive(subItem.path));
      });

      if (index !== -1) {
        setOpenSubmenu({ type: menuType, index });
      }
    }
  }, [location.pathname, navItems, othersItems, isActive]);

  // Gestion de la hauteur des sous-menus
  useEffect(() => {
    const updateSubMenuHeight = () => {
      const newHeights: Record<string, number> = {};
      Object.keys(subMenuRefs.current).forEach((key) => {
        const element = subMenuRefs.current[key];
        if (element) {
          newHeights[key] = element.scrollHeight;
        }
      });
      setSubMenuHeight(newHeights);
    };

    updateSubMenuHeight();
    window.addEventListener("resize", updateSubMenuHeight);
    return () => window.removeEventListener("resize", updateSubMenuHeight);
  }, [navItems, othersItems]);

  // Suppression de la suppression automatique lors du clic sur un lien
  const handleNavClick = (path: string, level: "root" | "sub") => (e: React.MouseEvent) => {
    e.stopPropagation();
    debug("clickLink", { level, path });
    if (level === "sub") {
      setSuppressAutoOpenPath(path);
      setTimeout(() => setSuppressAutoOpenPath(null), 100);
    }
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                onClick={handleNavClick(nav.path, "root")}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`] ?? (subMenuRefs.current[`${menuType}-${index}`]?.scrollHeight || 0)}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      onClick={handleNavClick(subItem.path, "sub")}
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
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
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
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/superadmin/home">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="ClinLab ERP SuperAdmin"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="ClinLab ERP SuperAdmin"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="ClinLab ERP SuperAdmin"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Modules SuperAdmin"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Administration"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;
