# ClinLab ERP - Système de Gestion de Laboratoire Hospitalier

[![ClinLab ERP](https://img.shields.io/badge/ClinLab-ERP-blue.svg)](https://clinlab-erp.com)
[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0.8-blue.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.1.0-blue.svg)](https://vitejs.dev/)

## 🌟 **ClinLab ERP - Solution Complète de Gestion de Laboratoire**

ClinLab ERP est une solution moderne et complète de gestion de laboratoire hospitalier, développée avec les technologies les plus récentes pour offrir une expérience utilisateur exceptionnelle et une gestion efficace des processus médicaux.

### 🚀 **Fonctionnalités Principales**

- **📊 Tableau de bord interactif** avec métriques en temps réel
- **👥 Gestion des patients** et des médecins
- **🔬 Gestion des examens** et demandes d'analyses
- **📦 Gestion des stocks** et alertes automatiques
- **💰 Facturation** et suivi des paiements
- **👨‍💼 Gestion RH** avec horaires et présences
- **🏢 Multi-tenancy** pour plusieurs laboratoires
- **🔐 Authentification sécurisée** avec rôles et permissions
- **📈 Rapports et statistiques** avancés
- **📱 Interface responsive** et moderne

### 🛠️ **Technologies Utilisées**

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Bundler**: Vite
- **Routing**: React Router
- **Charts**: ApexCharts
- **Calendar**: FullCalendar
- **Icons**: SVG Icons personnalisés

### 📋 **Prérequis**

Avant de commencer avec ClinLab ERP, assurez-vous d'avoir les éléments suivants installés et configurés :

- **Node.js** (version 18 ou supérieure)
- **npm** ou **yarn** (gestionnaire de paquets)
- **Git** (pour le contrôle de version)

### 🚀 **Installation et Démarrage**

1. **Cloner le repository**
   ```bash
   git clone https://github.com/votre-organisation/clinlab-erp.git
   cd clinlab-erp
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```

4. **Ouvrir dans le navigateur**
   ```
   http://localhost:5173
   ```

### 📁 **Structure du Projet**

```
clinlab-erp/
├── src/
│   ├── components/
│   │   ├── auth/           # Composants d'authentification
│   │   ├── common/         # Composants communs
│   │   ├── form/           # Composants de formulaires
│   │   ├── laboratory/     # Composants spécifiques au laboratoire
│   │   └── ui/             # Composants d'interface utilisateur
│   ├── icons/              # Icônes SVG personnalisées
│   ├── layout/             # Layouts de l'application
│   ├── pages/              # Pages de l'application
│   └── context/            # Contextes React
├── public/                 # Assets statiques
└── package.json
```

### 🎨 **Personnalisation**

ClinLab ERP est conçu pour être facilement personnalisable :

- **Thèmes**: Support du mode sombre/clair
- **Couleurs**: Palette de couleurs médicales
- **Langues**: Interface en français
- **Modules**: Architecture modulaire extensible

### 🔧 **Scripts Disponibles**

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Compile l'application pour la production
- `npm run lint` - Vérifie le code avec ESLint
- `npm run preview` - Prévisualise la version de production

### 📊 **Modules Principaux**

#### **Gestion des Patients**
- Enregistrement et suivi des patients
- Types de patients configurables
- Historique médical

#### **Gestion des Médecins**
- Répertoire des médecins prescripteurs
- Informations de contact
- Numéros d'identification

#### **Gestion des Examens**
- Catalogue d'examens
- Réactifs nécessaires
- Délais de rendu

#### **Demandes d'Examens**
- Suivi des demandes
- Statuts en temps réel
- Résultats d'analyses

#### **Gestion des Stocks**
- Inventaire des articles
- Alertes de stock critique
- Mouvements de stock

#### **Facturation**
- Génération de factures
- Suivi des paiements
- Rapports financiers

### 🔐 **Sécurité**

- **Authentification multi-niveaux** (Utilisateur/SuperAdmin)
- **Gestion des rôles et permissions**
- **Audit trail** complet
- **Chiffrement des données sensibles**

### 📱 **Responsive Design**

ClinLab ERP s'adapte parfaitement à tous les écrans :
- **Desktop**: Interface complète avec sidebar
- **Tablet**: Interface adaptée
- **Mobile**: Navigation optimisée

### 🌐 **Multi-tenancy**

Support complet pour plusieurs laboratoires :
- **Isolation des données** par compagnie
- **Configuration personnalisée** par tenant
- **Gestion centralisée** par super administrateur

### 📈 **Rapports et Analytics**

- **Statistiques en temps réel**
- **Graphiques interactifs**
- **Exports personnalisables**
- **Tableaux de bord configurables**

### 🤝 **Contribution**

Nous accueillons les contributions ! Pour contribuer :

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

### 📄 **Licence**

ClinLab ERP est distribué sous la licence MIT. Voir le fichier `LICENSE` pour plus de détails.

### 📞 **Support**

Pour toute question ou support :
- **Email**: support@clinlab-erp.com
- **Documentation**: https://docs.clinlab-erp.com
- **Issues**: https://github.com/votre-organisation/clinlab-erp/issues

---

**ClinLab ERP** - Simplifiez la gestion de votre laboratoire médical avec notre solution ERP moderne et intuitive.
