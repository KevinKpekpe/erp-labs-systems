import { useCallback, useEffect, useRef, useState } from "react";
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

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// Navigation principale - Modules de gestion
const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Tableau de bord",
    path: "/",
  },
  {
    icon: <PatientIcon />,
    name: "Gestion des Patients",
    subItems: [
      { name: "Liste des patients", path: "/patients", pro: false },
      { name: "Nouveau patient", path: "/patients/nouveau", pro: false },
      { name: "Types de patients", path: "/types-patients", pro: false },
    ],
  },
  {
    icon: <DoctorIcon />,
    name: "Gestion des Médecins",
    subItems: [
      { name: "Liste des médecins", path: "/medecins", pro: false },
      { name: "Nouveau médecin", path: "/medecins/nouveau", pro: false },
    ],
  },
  {
    icon: <ExamIcon />,
    name: "Gestion des Examens",
    subItems: [
      { name: "Types d'examens", path: "/examens", pro: false },
      { name: "Nouvel examen", path: "/examens/nouveau", pro: false },
      { name: "Réactifs nécessaires", path: "/examens/reactifs", pro: false },
    ],
  },
  {
    icon: <DemandeIcon />,
    name: "Demandes d'Examens",
    subItems: [
      { name: "Demandes en cours", path: "/demandes", pro: false },
      { name: "Nouvelle demande", path: "/demandes/nouvelle", pro: false },
      { name: "Résultats", path: "/demandes/resultats", pro: false },
    ],
  },
  {
    icon: <StockIcon />,
    name: "Gestion des Stocks",
    subItems: [
      { name: "Tableau de bord", path: "/stocks", pro: false },
      { name: "Articles en stock", path: "/stocks/articles", pro: false },
      { name: "Mouvements", path: "/stocks/mouvements", pro: false },
      { name: "Alertes", path: "/stocks/alertes", pro: false },
      { name: "Catégories", path: "/stocks/categories", pro: false },
    ],
  },
  {
    icon: <BillingIcon />,
    name: "Facturation",
    subItems: [
      { name: "Factures", path: "/factures", pro: false },
      { name: "Paiements", path: "/factures/paiements", pro: false },
      { name: "Rapports", path: "/factures/rapports", pro: false },
    ],
  },
  {
    icon: <EmployeeIcon />,
    name: "Gestion RH",
    subItems: [
      { name: "Employés", path: "/employes", pro: false },
      { name: "Horaires", path: "/employes/horaires", pro: false },
      { name: "Présences", path: "/employes/presences", pro: false },
    ],
  },
];

// Navigation secondaire - Administration et outils
const othersItems: NavItem[] = [
  {
    icon: <CompanyIcon />,
    name: "Multi-tenancy",
    subItems: [
      { name: "Informations Compagnie", path: "/company-info", pro: false },
      { name: "Compagnies", path: "/companies", pro: false },
      { name: "Configuration", path: "/companies/config", pro: false },
    ],
  },
  {
    icon: <UsersIcon />,
    name: "Utilisateurs & Rôles",
    subItems: [
      { name: "Utilisateurs", path: "/users", pro: false },
      { name: "Rôles", path: "/users/roles", pro: false },
      { name: "Permissions", path: "/permissions", pro: false },
    ],
  },
  {
    icon: <AuditIcon />,
    name: "Audit & Logs",
    subItems: [
      { name: "Logs système", path: "/audit/logs", pro: false },
      { name: "Traçabilité", path: "/audit/trace", pro: false },
    ],
  },
  {
    icon: <CalenderIcon />,
    name: "Calendrier",
    path: "/calendar",
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
      { name: "Statistiques", path: "/rapports/stats", pro: false },
      { name: "Analyses", path: "/rapports/analyses", pro: false },
      { name: "Exports", path: "/rapports/exports", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentification",
    subItems: [
      { name: "Connexion", path: "/signin", pro: false },
      { name: "Super Admin", path: "/superadmin", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
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
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
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
