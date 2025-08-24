import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Import des icônes
import {
  GridIcon,
  ChevronDownIcon,
  HorizontaLDots,
  PatientIcon,
  DoctorIcon,
  ExamIcon,
  DemandeIcon,
  StockIcon,
  BillingIcon,
  EmployeeIcon,
  CompanyIcon,
  UsersIcon,
  AuditIcon,
  CalenderIcon,
  UserCircleIcon,
  PieChartIcon,
  PlugInIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { useAuth } from "../context/AuthContext";

const debug = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.log("[Sidebar]", ...args);
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

// Navigation principale - Modules de gestion
const baseNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Tableau de bord",
    path: "/",
    requiredPermission: { action: "READ", module: "COMPANY" },
  },
  {
    icon: <PatientIcon />,
    name: "Gestion des Patients",
    requiredPermission: { action: "LIST", module: "PATIENT" },
    subItems: [
      { name: "Liste des patients", path: "/patients", requiredPermission: { action: "LIST", module: "PATIENT" } },
      { name: "Nouveau patient", path: "/patients/nouveau", requiredPermission: { action: "CREATE", module: "PATIENT" } },
      { name: "Types de patients", path: "/types-patients", requiredPermission: { action: "LIST", module: "PATIENT" } },
    ],
  },
  {
    icon: <DoctorIcon />,
    name: "Gestion des Médecins",
    requiredPermission: { action: "LIST", module: "MEDECIN" },
    subItems: [
      { name: "Liste des médecins", path: "/medecins", requiredPermission: { action: "LIST", module: "MEDECIN" } },
      { name: "Nouveau médecin", path: "/medecins/nouveau", requiredPermission: { action: "CREATE", module: "MEDECIN" } },
    ],
  },
  {
    icon: <ExamIcon />,
    name: "Gestion des Examens",
    requiredPermission: { action: "LIST", module: "EXAMEN" },
    subItems: [
      { name: "Types d'examens", path: "/examens", requiredPermission: { action: "LIST", module: "EXAMEN" } },
      { name: "Nouvel examen", path: "/examens/nouveau", requiredPermission: { action: "CREATE", module: "EXAMEN" } },
      { name: "Réactifs nécessaires", path: "/examens/reactifs", requiredPermission: { action: "LIST", module: "EXAMEN" } },
    ],
  },
  {
    icon: <DemandeIcon />,
    name: "Demandes d'Examens",
    requiredPermission: { action: "LIST", module: "DEMANDE_EXAMEN" },
    subItems: [
      { name: "Demandes en cours", path: "/demandes", requiredPermission: { action: "LIST", module: "DEMANDE_EXAMEN" } },
      { name: "Nouvelle demande", path: "/demandes/nouvelle", requiredPermission: { action: "CREATE", module: "DEMANDE_EXAMEN" } },
      { name: "Résultats", path: "/demandes/resultats", requiredPermission: { action: "LIST", module: "DEMANDE_EXAMEN" } },
    ],
  },
  {
    icon: <StockIcon />,
    name: "Gestion des Stocks",
    requiredPermission: { action: "LIST", module: "STOCK" },
    subItems: [
      { name: "Dashboard Laboratoire", path: "/stocks/laboratory", requiredPermission: { action: "LIST", module: "STOCK" } },
      { name: "Dashboard FIFO", path: "/stocks/lots/dashboard", requiredPermission: { action: "LIST", module: "STOCK" } },
      { name: "Stocks", path: "/stocks/stocks", requiredPermission: { action: "LIST", module: "STOCK" } },
      { name: "Articles en stock", path: "/stocks/articles", requiredPermission: { action: "LIST", module: "STOCK" } },
      { name: "Catégories d'articles", path: "/stocks/categories", requiredPermission: { action: "LIST", module: "STOCK" } },
      { name: "Corbeille", path: "/stocks/lots-trashed", requiredPermission: { action: "LIST", module: "STOCK" } },
      { name: "Lots expirés", path: "/stocks/lots/expired", requiredPermission: { action: "LIST", module: "STOCK" } },
      { name: "Mouvements", path: "/stocks/mouvements", requiredPermission: { action: "LIST", module: "STOCK" } },
      { name: "Alertes", path: "/stocks/alertes", requiredPermission: { action: "LIST", module: "STOCK" } },
    ],
  },
  {
    icon: <BillingIcon />,
    name: "Facturation",
    subItems: [
      { name: "Factures", path: "/factures", requiredPermission: { action: "LIST", module: "FACTURE" } },
      { name: "Paiements", path: "/factures/paiements", requiredPermission: { action: "LIST", module: "PAIEMENT" } }
    ],
  },
  {
    icon: <EmployeeIcon />,
    name: "Gestion RH",
    subItems: [
      { name: "Employés", path: "/employes", requiredPermission: { action: "LIST", module: "EMPLOYE" } },
      { name: "Horaires", path: "/employes/horaires", requiredPermission: { action: "LIST", module: "HORAIRE_EMPLOYE" } },
      { name: "Présences", path: "/employes/presences", requiredPermission: { action: "LIST", module: "PRESENCE_EMPLOYE" } },
    ],
  },
];

// Navigation secondaire - Administration et outils
const baseOthersItems: NavItem[] = [
  {
    icon: <CompanyIcon />,
    name: "Multi-tenancy",
    subItems: [
      { name: "Informations Compagnie", path: "/company-info", requiredPermission: { action: "UPDATE", module: "COMPANY" }, requiredKind: "company" },
      { name: "Compagnies", path: "/companies", requiredKind: "superadmin" },
      { name: "Configuration", path: "/companies/config", requiredKind: "superadmin" },
    ],
  },
  {
    icon: <UsersIcon />,
    name: "Utilisateurs & Rôles",
    subItems: [
      { name: "Utilisateurs", path: "/users", requiredPermission: { action: "LIST", module: "USER" } },
      { name: "Rôles", path: "/users/roles", requiredPermission: { action: "LIST", module: "ROLE" } },
      { name: "Permissions", path: "/permissions", requiredKind: "superadmin" },
    ],
  },
  {
    icon: <AuditIcon />,
    name: "Audit & Logs",
    subItems: [
      { name: "Logs système", path: "/audit/logs", requiredKind: "superadmin" },
      { name: "Traçabilité", path: "/audit/trace", requiredKind: "superadmin" },
    ],
  },
  {
    icon: <CalenderIcon />,
    name: "Calendrier",
    path: "/calendar",
    requiredPermission: { action: "READ", module: "COMPANY" },
  },
  {
    icon: <UserCircleIcon />,
    name: "Profil",
    path: "/profile",
  },
  {
    icon: <PieChartIcon />,
    name: "Rapports",
    subItems: [
      { name: "Dashboard financier", path: "/factures/dashboard", requiredPermission: { action: "LIST", module: "FACTURE" } },
      { name: "Statistiques", path: "/rapports/stats", requiredPermission: { action: "LIST", module: "EXAMEN" } },
      { name: "Analyses", path: "/rapports/analyses", requiredPermission: { action: "LIST", module: "EXAMEN" } },
      { name: "Exports", path: "/rapports/exports", requiredPermission: { action: "LIST", module: "EXAMEN" } },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentification",
    subItems: [
      { name: "Connexion", path: "/signin" },
      { name: "Super Admin", path: "/superadmin" },
    ],
  },
];

const AppSidebar: React.FC = () => {
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

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const canSee = useCallback(
    (req?: PermissionReq, requiredKind?: "company" | "superadmin") => {
      if (requiredKind && state.kind && state.kind !== requiredKind) return false;
      if (state.kind === "superadmin") return true;
      if (!req) return true; // pas de permission requise
      if (state.loading) return false; // masquer tant que non chargé
      if ((state.permissions?.length ?? 0) === 0) return false; // aucun droit => masquer
      return hasPermission(req.action, req.module);
    },
    [state.kind, state.permissions, state.loading, hasPermission]
  );

  const navItems = useMemo(() => {
    const result = baseNavItems
      .map((item) => {
        const subItems = item.subItems?.filter((si) => canSee(si.requiredPermission, si.requiredKind));
        const parentNavigable = !!item.path && canSee(item.requiredPermission, item.requiredKind);
        const hasVisibleChildren = !!(subItems && subItems.length > 0);
        const parentExplicitAllowedWithoutPath = !item.path && !!item.requiredPermission && canSee(item.requiredPermission, item.requiredKind);
        const shouldShow = parentNavigable || hasVisibleChildren || parentExplicitAllowedWithoutPath;
        if (!shouldShow) return null;
        return { ...item, subItems } as NavItem;
      })
      .filter(Boolean) as NavItem[];
    debug("navItems", { count: result.length });
    return result;
  }, [canSee]);

  const othersItems = useMemo(() => {
    const filtered = baseOthersItems.filter((g) => (g.name === "Authentification" ? !state.token : true));
    const result = filtered
      .map((item) => {
        const subItems = item.subItems?.filter((si) => canSee(si.requiredPermission, si.requiredKind));
        const parentNavigable = !!item.path && canSee(item.requiredPermission, item.requiredKind);
        const hasVisibleChildren = !!(subItems && subItems.length > 0);
        const parentExplicitAllowedWithoutPath = !item.path && !!item.requiredPermission && canSee(item.requiredPermission, item.requiredKind);
        const shouldShow = parentNavigable || hasVisibleChildren || parentExplicitAllowedWithoutPath;
        if (!shouldShow) return null;
        return { ...item, subItems } as NavItem;
      })
      .filter(Boolean) as NavItem[];
    debug("othersItems", { count: result.length });
    return result;
  }, [canSee, state.token]);

  useEffect(() => {
    debug("route", location.pathname, { suppressAutoOpenPath, openSubmenu });
    if (openSubmenu !== null) return; // ne pas écraser l'état ouvert manuellement
    if (suppressAutoOpenPath === location.pathname) return; // l'utilisateur a fermé pour cette route
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              debug("autoOpenSubmenu", { menuType, index });
              setOpenSubmenu({ type: menuType as "main" | "others", index });
            }
          });
        }
      });
    });
  }, [location.pathname, isActive, navItems, othersItems, openSubmenu, suppressAutoOpenPath]);

  // Réinitialiser la suppression quand on change de route
  useEffect(() => {
    if (suppressAutoOpenPath && suppressAutoOpenPath !== location.pathname) {
      setSuppressAutoOpenPath(null);
    }
  }, [location.pathname, suppressAutoOpenPath]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        const h = subMenuRefs.current[key]?.scrollHeight || 0;
        debug("measure", { key, h });
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: h,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    if (!(isExpanded || isHovered || isMobileOpen)) {
      setIsHovered(true);
    }
    debug("toggleSubmenu", { index, menuType });
    setOpenSubmenu((prevOpenSubmenu) => {
      debug("prevOpenSubmenu", prevOpenSubmenu);
      if (prevOpenSubmenu && prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === index) {
        // L'utilisateur ferme manuellement le submenu pour la route en cours
        setSuppressAutoOpenPath(location.pathname);
        return null;
      }
      return { type: menuType, index };
    });
  };

  const handleNavClick = (path: string, level: "root" | "sub") => (e: React.MouseEvent) => {
    e.stopPropagation();
    debug("clickLink", { level, path });
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
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
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
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="ClinLab ERP"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="ClinLab ERP"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="ClinLab ERP"
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
                  "Modules"
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

export default AppSidebar;
