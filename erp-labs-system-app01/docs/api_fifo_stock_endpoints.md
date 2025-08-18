# API FIFO Stock Management - Nouveaux Endpoints

## Vue d'ensemble

Cette documentation décrit les nouveaux endpoints pour la gestion des stocks avec le principe FIFO (First In, First Out) et FEFO (First Expired, First Out).

## Architecture

### Modèles Principaux

1. **Stock** - Vue agrégée des articles avec quantités calculées
2. **StockLot** - Lots individuels avec traçabilité FIFO
3. **StockMovement** - Mouvements liés aux lots
4. **FifoStockService** - Service pour la logique FIFO/FEFO

## Endpoints Principaux

### Gestion des Stocks (Vue Agrégée)

#### GET `/api/companies/stock/stocks`
Liste des stocks avec quantités calculées depuis les lots
- **Nouveaux champs** : `quantite_actuelle_lots`, `valeur_stock`, `has_expired_lots`, `has_near_expiration_lots`

#### GET `/api/companies/stock/stocks/{stock}`
Détails d'un stock avec overview des lots
- **Nouveaux champs** : `lots_overview`, `quantite_actuelle_lots`, `valeur_stock`

### Gestion FIFO des Lots

#### POST `/api/companies/stock/stocks/{stock}/lots`
Créer un nouveau lot (entrée de stock)
```json
{
  "article_id": 1,
  "quantite_initiale": 100,
  "date_entree": "2025-01-15 10:00:00",
  "date_expiration": "2025-12-31",
  "prix_unitaire_achat": 15.50,
  "numero_lot": "LOT-2025-001",
  "fournisseur_lot": "Fournisseur ABC",
  "commentaire": "Nouvelle livraison"
}
```

#### POST `/api/companies/stock/stocks/{stock}/consume`
Consommer du stock avec FIFO/FEFO/Manuel
```json
{
  "quantite": 50,
  "date_mouvement": "2025-01-16 14:30:00",
  "motif": "Utilisation en laboratoire",
  "demande_id": 123,
  "methode_sortie": "fifo", // "fifo", "fefo", "manual"
  "lots_manuels": [ // Requis si methode_sortie = "manual"
    {
      "lot_id": 1,
      "quantite": 30
    },
    {
      "lot_id": 2,
      "quantite": 20
    }
  ]
}
```

#### GET `/api/companies/stock/stocks/{stock}/lots`
Liste des lots pour un stock donné

#### GET `/api/companies/stock/stocks/{stock}/available-lots`
Lots disponibles avec ordre FIFO et FEFO
```json
{
  "lots": [...],
  "total_available": 150,
  "fifo_order": [...],
  "fefo_order": [...]
}
```

#### GET `/api/companies/stock/stocks/{stockId}/lots/{lotId}`
Détails d'un lot spécifique

### Gestion Avancée des Lots

#### GET `/api/companies/stock/lots`
Liste globale des lots avec filtres
- **Paramètres** : `article_id`, `available_only`, `expired_only`, `near_expiration_only`, `days`

#### GET `/api/companies/stock/lots/{stockLot}`
Détails complets d'un lot

#### PUT `/api/companies/stock/lots/{stockLot}`
Modifier un lot (champs non critiques uniquement)
```json
{
  "date_expiration": "2025-12-31",
  "prix_unitaire_achat": 16.00,
  "numero_lot": "LOT-2025-001-MODIFIE",
  "fournisseur_lot": "Nouveau fournisseur",
  "commentaire": "Commentaire mis à jour"
}
```

#### DELETE `/api/companies/stock/lots/{stockLot}`
Supprimer un lot (si vide et sans mouvements récents)

#### GET `/api/companies/stock/lots-expired`
Lots expirés avec stock restant

#### GET `/api/companies/stock/lots-near-expiration`
Lots proches de l'expiration
- **Paramètre** : `days` (défaut: 30)

#### GET `/api/companies/stock/lots-value`
Statistiques de valeur des stocks
```json
{
  "total_lots": 25,
  "total_quantity": 500,
  "total_value": 7500.00,
  "average_unit_price": 15.00,
  "lots_with_expiration": 20,
  "expired_lots": 2,
  "near_expiration_lots": 5
}
```

### Mouvements (Principalement en Lecture)

#### GET `/api/companies/stock/movements`
Liste des mouvements avec informations des lots
- **Nouveaux champs** : `stockLot`, `valeur_totale`

#### GET `/api/companies/stock/movements/{movement}`
Détails d'un mouvement

#### PUT `/api/companies/stock/movements/{movement}`
Modifier un mouvement (champs non critiques uniquement : `date_mouvement`, `motif`)

#### DELETE `/api/companies/stock/movements/{movement}`
Supprimer un mouvement (< 24h uniquement, avec restauration automatique des lots)

#### GET `/api/companies/stock/movements/by-lot/{lotId}`
Mouvements pour un lot donné

#### GET `/api/companies/stock/movements/by-article/{articleId}`
Mouvements pour un article donné

## Méthodes de Sortie

### FIFO (First In, First Out)
Les lots les plus anciens (par `date_entree`) sortent en premier.

### FEFO (First Expired, First Out)
Les lots avec la `date_expiration` la plus proche sortent en premier, puis par `date_entree`.

### Manuel
Sélection manuelle des lots et quantités à consommer.

## Changements Majeurs

### API Dépréciées
- `POST /api/companies/stock/movements` - Remplacé par `POST /api/companies/stock/stocks/{stock}/consume`
- `POST /api/companies/stock/stocks/{stock}/add` - Remplacé par `POST /api/companies/stock/stocks/{stock}/lots`

### Nouveaux Champs Calculés
- `quantite_actuelle_calculee` - Calculée depuis les lots
- `valeur_stock` - Valeur totale des lots disponibles
- `lots_overview` - Statistiques des lots pour un stock

### Restrictions de Sécurité
- Les mouvements > 24h ne peuvent plus être supprimés
- Les quantités et lots ne peuvent plus être modifiés directement
- La suppression de lots nécessite qu'ils soient vides

## Migration des Données

La migration `2025_08_16_000003_convert_existing_stocks_to_lots.php` convertit automatiquement :
- Les stocks existants en lots avec `numero_lot = "MIGRATION-{stock_id}"`
- Les mouvements orphelins sont liés aux lots correspondants
- Un mouvement d'entrée est créé pour chaque lot migré

## Bonnes Pratiques

1. **Entrées** : Toujours utiliser `POST /stocks/{stock}/lots` pour les nouvelles livraisons
2. **Sorties** : Privilégier FIFO pour la rotation normale, FEFO pour les produits périssables
3. **Traçabilité** : Utiliser les `numero_lot` et `fournisseur_lot` pour la traçabilité
4. **Surveillance** : Monitorer régulièrement les lots expirés et proches de l'expiration
5. **Performance** : Utiliser les filtres appropriés pour limiter les résultats des API de liste

## Exemples d'Usage

### Workflow Typique d'Entrée
1. Réception de marchandise → `POST /stocks/{stock}/lots`
2. Vérification du lot → `GET /stocks/{stockId}/lots/{lotId}`
3. Mise à jour si nécessaire → `PUT /lots/{stockLot}`

### Workflow Typique de Sortie
1. Vérification du stock disponible → `GET /stocks/{stock}/available-lots`
2. Consommation FIFO → `POST /stocks/{stock}/consume` avec `methode_sortie: "fifo"`
3. Vérification du mouvement → `GET /movements/{movement}`

### Surveillance des Expirations
1. Lots expirés → `GET /lots-expired`
2. Lots proches expiration → `GET /lots-near-expiration?days=7`
3. Actions correctives sur les lots identifiés
