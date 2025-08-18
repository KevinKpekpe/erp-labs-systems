# 🏥 Guide d'Utilisation - ERP Laboratoire Hospitalier

## ✅ **SYSTÈME COMPLET OPÉRATIONNEL**

Votre ERP est maintenant entièrement configuré pour un laboratoire hospitalier avec une gestion de stock FIFO/FEFO professionnelle.

---

## 🎯 **Fonctionnalités Principales**

### **1. Gestion des Catégories de Laboratoire**
- **URL**: `/stocks/categories/laboratory`
- **Création**: `/stocks/categories/laboratory/new`
- **Fonctionnalités**:
  - Types spécialisés (Réactifs, Consommables, Équipements, Contrôles, etc.)
  - Conditions de stockage (température, humidité, sensibilité lumière)
  - Chaîne du froid critique
  - Délais d'alerte personnalisés par type

### **2. Dashboard Laboratoire**
- **URL**: `/stocks/laboratory`
- **Vue d'ensemble**:
  - Valeur totale du stock
  - Stocks critiques
  - Lots expirés
  - Alertes prioritaires
  - Répartition par types
  - Actions rapides

### **3. Création de Stock Laboratoire**
- **URL**: `/stocks/stocks/laboratory/new`
- **Fonctionnalités**:
  - Sélection d'article avec conditions laboratoire
  - Validation automatique selon le type
  - Création simultanée stock + lot initial
  - Alertes visuelles pour chaîne du froid

### **4. Système FIFO/FEFO Complet**
- **Dashboard FIFO**: `/stocks/lots/dashboard`
- **Consommation intelligente**: FIFO, FEFO, ou manuelle
- **Gestion des lots**: Création, suivi, expiration
- **Corbeille**: `/stocks/lots-trashed` (soft delete)

---

## 🚀 **Guide de Démarrage Rapide**

### **Étape 1: Créer les Catégories de Laboratoire**
1. Aller à **"Gestion des Stocks"** → **"Catégories laboratoire"**
2. Cliquer **"Nouvelle catégorie"**
3. Remplir les informations laboratoire:
   - Type (Réactifs, Consommables, etc.)
   - Conditions de stockage
   - Températures min/max
   - Sensibilité lumière
   - Chaîne du froid critique

**Exemple - Réactifs Biochimie:**
```
Nom: Réactifs Biochimie
Type: Réactifs
Conditions: Réfrigération +2°C à +8°C, à l'abri de la lumière
Température min: 2°C
Température max: 8°C
☑️ Sensible à la lumière
☑️ Chaîne du froid critique
Délai d'alerte: 15 jours
```

### **Étape 2: Créer des Articles**
1. Aller à **"Articles en stock"**
2. Associer chaque article à une catégorie laboratoire
3. Les conditions de laboratoire seront automatiquement héritées

### **Étape 3: Créer des Stocks de Laboratoire**
1. Aller à **"Stocks"** → Bouton **"Stock labo"**
2. Sélectionner un article (les conditions apparaissent automatiquement)
3. Définir le seuil critique
4. Créer le lot initial:
   - Quantité
   - Numéro de lot
   - Date d'expiration (obligatoire si chaîne du froid)
   - Prix et fournisseur

### **Étape 4: Gérer avec FIFO/FEFO**
1. **Dashboard FIFO** pour voir les lots expirés/proches expiration
2. **Consommer du stock** avec logique automatique:
   - FIFO: Premier entré, premier sorti
   - FEFO: Premier expiré, premier sorti
   - Manuel: Sélection spécifique de lots

---

## 📊 **Navigation du Système**

### **Menu Principal: "Gestion des Stocks"**
```
📊 Dashboard Laboratoire      → Vue d'ensemble complète
📈 Dashboard FIFO            → Gestion des lots et expirations
📦 Stocks                    → Liste et gestion des stocks
📋 Articles en stock         → Gestion des articles
🧪 Catégories laboratoire    → Types de produits de laboratoire
🗑️ Corbeille                → Lots supprimés (récupérables)
📄 Mouvements               → Historique des mouvements
⚠️ Alertes                  → Notifications système
```

### **Actions Rapides par Stock**
```
👁️ Voir lots               → Liste des lots d'un stock
➕ Nouveau lot             → Ajouter un nouveau lot
⬇️ Consommer               → Consommer selon FIFO/FEFO/Manuel
```

---

## ⚡ **Fonctionnalités Avancées**

### **Alertes Automatiques**
- **Lots expirés**: Notification immédiate
- **Stock critique**: Alerte si sous le seuil
- **Chaîne du froid**: Surveillance spéciale
- **Proche expiration**: Selon délai défini par catégorie

### **Conditions de Laboratoire**
- **Température**: Validation automatique des plages
- **Humidité**: Surveillance et alertes
- **Sensibilité lumière**: Indicateurs visuels
- **Traçabilité**: Historique complet des lots

### **Système de Corbeille**
- **Soft delete**: Suppression réversible
- **Validation métier**: Impossible de supprimer lot avec stock restant
- **Restauration**: Récupération des lots supprimés par erreur

---

## 🏥 **Conformité Hospitalière**

### **Traçabilité Complète**
✅ Numéro de lot obligatoire  
✅ Date d'entrée et d'expiration  
✅ Fournisseur et prix d'achat  
✅ Historique des mouvements  
✅ Utilisateur responsable  

### **Gestion des Risques**
✅ Chaîne du froid critique  
✅ Contrôle des dates d'expiration  
✅ Alertes proactives  
✅ Conditions de stockage  
✅ Audit trail complet  

### **Optimisation FIFO/FEFO**
✅ Rotation automatique des stocks  
✅ Minimisation des pertes  
✅ Conformité réglementaire  
✅ Gestion intelligente des lots  

---

## 🎉 **Votre ERP est Prêt !**

Le système est maintenant **entièrement opérationnel** pour un laboratoire hospitalier professionnel avec:

- ✅ **Gestion spécialisée** par type de produit laboratoire
- ✅ **FIFO/FEFO automatique** pour optimiser la rotation
- ✅ **Traçabilité complète** conforme aux exigences hospitalières
- ✅ **Alertes intelligentes** pour prévenir les risques
- ✅ **Interface intuitive** adaptée aux professionnels de santé

**Commencez par le Dashboard Laboratoire** → `/stocks/laboratory` pour découvrir toutes les fonctionnalités ! 🚀
