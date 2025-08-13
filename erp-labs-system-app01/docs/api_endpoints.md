## Base
- **baseUrl**: http://localhost:8000
- **apiBase**: {{baseUrl}}/api

## Web
- **GET** `/`

## SuperAdmin (prefix: `/api/v1/superadmin`)

### Public
- **POST** `/login`
```json
{
  "login": "admin",
  "password": "secret123"
}
```
- **POST** `/forgot-password`
```json
{
  "email": "superadmin@example.com"
}
```
- **POST** `/reset-password`
```json
{
  "email": "superadmin@example.com",
  "otp": "123456",
  "new_password": "NewPassw0rd!",
  "new_password_confirmation": "NewPassw0rd!"
}
```
- **POST** `/resend-otp`
```json
{
  "email": "superadmin@example.com"
}
```

### Protégé (Bearer token requis)
- **GET** `/me`
- **POST** `/logout`
- **POST** `/profile`
```json
{
  "name": "Super Admin",
  "username": "superadmin",
  "email": "superadmin@example.com",
  "telephone": "+243900000000",
  "sexe": "M",
  "remove_photo": false
}
```
- **POST** `/change-password`
```json
{
  "current_password": "OldPassw0rd!",
  "new_password": "NewPassw0rd!",
  "new_password_confirmation": "NewPassw0rd!"
}
```

#### Permissions
- **GET** `/permissions`
- **POST** `/permissions`
```json
{
  "nom": "CAN_VIEW_DASHBOARD"
}
```
- **GET** `/permissions/{permission}`
- **PUT** `/permissions/{permission}`
```json
{
  "nom": "CAN_EDIT_USER"
}
```
- **DELETE** `/permissions/{permission}`
- **GET** `/permissions-trashed`
- **POST** `/permissions/{id}/restore`
- **DELETE** `/permissions/{id}/force`

#### Companies (multipart/form-data pour le logo)
- **POST** `/companies`
Form-data:
- `logo`: [file] (optionnel)
- `nom_company`: ClinLab
- `adresse`: 10, Ave Test
- `email`: contact@clinlab.com
- `contact`: +243811111111
- `secteur_activite`: Privé
- `type_etablissement`: Privé
- `description`: Laboratoire d'analyses
- `admin_username`: admin
- `admin_email`: admin@clinlab.com

- **POST** `/companies/{company}` (update)
Form-data:
- `logo`: [file] (optionnel)
- `remove_logo`: false
- `nom_company`: ClinLab Updated
- `adresse`: 20, Ave Test
- `email`: info@clinlab.com
- `contact`: +243822222222
- `secteur_activite`: Public
- `type_etablissement`: Public
- `description`: Maj des infos

---

## Entreprise (prefix: `/api/v1`)

### Public
- **POST** `/auth/login`
```json
{
  "company_code": 1001,
  "login": "user1",
  "password": "secret123"
}
```
- **POST** `/auth/forgot-password`
```json
{
  "company_code": 1001,
  "email": "user1@example.com"
}
```
- **POST** `/auth/reset-password`
```json
{
  "company_code": 1001,
  "email": "user1@example.com",
  "otp": "123456",
  "new_password": "NewPassw0rd!",
  "new_password_confirmation": "NewPassw0rd!"
}
```
- **POST** `/auth/resend-otp`
```json
{
  "company_code": 1001,
  "email": "user1@example.com"
}
```

### Protégé (Bearer token requis)
- **POST** `/auth/change-password`
```json
{
  "current_password": "OldPassw0rd!",
  "new_password": "NewPassw0rd!",
  "new_password_confirmation": "NewPassw0rd!"
}
```
- **POST** `/auth/logout`
- **GET** `/auth/me`
- **POST** `/auth/profile`
```json
{
  "username": "user1",
  "email": "user1@example.com",
  "telephone": "+243900000001",
  "sexe": "F",
  "remove_photo": false
}
```

- **POST** `/company` (mettre à jour ma société) — multipart/form-data
Form-data:
- `logo`: [file] (optionnel)
- `remove_logo`: false
- `nom_company`: ClinLab
- `adresse`: 10, Ave Test
- `email`: contact@clinlab.com
- `contact`: +243811111111
- `secteur_activite`: Privé
- `type_etablissement`: Privé
- `description`: Laboratoire d'analyses

#### Rôles
- **GET** `/roles`
- **GET** `/roles/{role}`
- **POST** `/roles`
```json
{
  "nom_role": "Secretaire",
  "permissions": [1, 2, 3]
}
```
- **PUT** `/roles/{role}`
```json
{
  "nom_role": "Secretaire Senior",
  "permissions": [1, 4]
}
```
- **DELETE** `/roles/{role}`
- **GET** `/roles-trashed`
- **POST** `/roles/{id}/restore`
- **DELETE** `/roles/{id}/force`

#### Utilisateurs
- **GET** `/users`
- **POST** `/users`
```json
{
  "username": "user2",
  "nom": "Doe",
  "postnom": "Junior",
  "email": "user2@example.com",
  "role_id": 2,
  "telephone": "+243911111111",
  "sexe": "M"
}
```
- **POST** `/users/{user}` (update)
```json
{
  "username": "user2",
  "email": "user2@newmail.com",
  "role_id": 3,
  "is_active": true,
  "telephone": "+243922222222",
  "sexe": "M",
  "remove_photo": false
}
```
- **DELETE** `/users/{user}`
- **GET** `/users-trashed`
- **POST** `/users/{id}/restore`
- **DELETE** `/users/{id}/force`

### Stock
#### Catégories
- **GET** `/stock/categories`
- **POST** `/stock/categories`
```json
{
  "nom_categorie": "Réactifs"
}
```
- **GET** `/stock/categories/{category}`
- **PUT** `/stock/categories/{category}`
```json
{
  "nom_categorie": "Consommables"
}
```
- **DELETE** `/stock/categories/{category}`
- **GET** `/stock/categories-trashed`
- **POST** `/stock/categories/{id}/restore`
- **DELETE** `/stock/categories/{id}/force`

#### Articles
- **GET** `/stock/articles`
- **POST** `/stock/articles`
```json
{
  "categorie_id": 1,
  "nom_article": "Gants",
  "description": "Taille M",
  "fournisseur": "Acme",
  "prix_unitaire": 2.5,
  "unite_mesure": "paquet"
}
```
- **GET** `/stock/articles/{article}`
- **PUT** `/stock/articles/{article}`
```json
{
  "nom_article": "Gants nitrile",
  "prix_unitaire": 3.0
}
```
- **DELETE** `/stock/articles/{article}`
- **GET** `/stock/articles-trashed`
- **POST** `/stock/articles/{id}/restore`
- **DELETE** `/stock/articles/{id}/force`

#### Stocks
- **GET** `/stock/stocks`
- **POST** `/stock/stocks`
```json
{
  "article_id": 1,
  "quantite_actuelle": 100,
  "seuil_critique": 10
}
```
- **GET** `/stock/stocks/{stock}`
- **PUT** `/stock/stocks/{stock}`
```json
{
  "seuil_critique": 20
}
```
- **DELETE** `/stock/stocks/{stock}`
- **GET** `/stock/stocks-trashed`
- **POST** `/stock/stocks/{id}/restore`
- **DELETE** `/stock/stocks/{id}/force`

#### Mouvements
- **GET** `/stock/movements`
- **POST** `/stock/movements`
```json
{
  "stock_id": 1,
  "quantite": 5,
  "type_mouvement": "Sortie",
  "date_mouvement": "2025-08-10",
  "demande_id": null,
  "motif": "Consommation"
}
```

#### Alertes
- **GET** `/stock/alerts`

### Patients
#### Types
- **GET** `/patients/types`
- **POST** `/patients/types`
```json
{
  "nom_type": "Entreprise",
  "description": "Employés"
}
```
- **GET** `/patients/types/{type}`
- **PUT** `/patients/types/{type}`
```json
{
  "nom_type": "VIP",
  "description": "Patients prioritaires"
}
```
- **DELETE** `/patients/types/{type}`
- **GET** `/patients/types-trashed`
- **POST** `/patients/types/{id}/restore`
- **DELETE** `/patients/types/{id}/force`

#### Médecins
- **GET** `/doctors`
- **POST** `/doctors`
```json
{
  "nom": "Mbayo",
  "prenom": "Jean",
  "date_naissance": "1980-01-01",
  "sexe": "M",
  "contact": "+243930000000",
  "numero_identification": "MED-0001"
}
```
- **GET** `/doctors/{doctor}`
- **PUT** `/doctors/{doctor}`
```json
{
  "contact": "+243931111111"
}
```
- **DELETE** `/doctors/{doctor}`
- **GET** `/doctors-trashed`
- **POST** `/doctors/{id}/restore`
- **DELETE** `/doctors/{id}/force`

#### Patients
- **GET** `/patients`
- **POST** `/patients`
```json
{
  "nom": "Kabasele",
  "postnom": "",
  "prenom": "Marie",
  "email": "",
  "date_naissance": "1995-05-20",
  "sexe": "F",
  "adresse": "Av. Test 123",
  "contact": "+243940000000",
  "type_patient_id": 1,
  "medecin_resident_id": null
}
```
- **GET** `/patients/{patient}`
- **PUT** `/patients/{patient}`
```json
{
  "adresse": "Av. Nouvelle 45",
  "contact": "+243940000111"
}
```
- **DELETE** `/patients/{patient}`
- **GET** `/patients-trashed`
- **POST** `/patients/{id}/restore`
- **DELETE** `/patients/{id}/force`

### Examens
- **GET** `/exams`
- **POST** `/exams`
```json
{
  "nom_examen": "Glycémie",
  "description": "A jeun",
  "prix": 15,
  "delai_rendu_estime": 24,
  "unites_mesure": "mg/dL",
  "valeurs_reference": "70-100",
  "type_echantillon": "Sang",
  "conditions_pre_analytiques": "8h de jeûne",
  "equipement_reactifs_necessaires": "Reactif X",
  "articles": [
    { "article_id": 1, "quantite_utilisee": 0.5 }
  ]
}
```
- **GET** `/exams/{exam}`
- **PUT** `/exams/{exam}`
```json
{
  "prix": 18,
  "delai_rendu_estime": 12,
  "articles": [
    { "article_id": 1, "quantite_utilisee": 0.4 }
  ]
}
```
- **DELETE** `/exams/{exam}`
- **GET** `/exams-trashed`
- **POST** `/exams/{id}/restore`
- **DELETE** `/exams/{id}/force`

### Demandes d'examen
- **GET** `/exam-requests`
- **POST** `/exam-requests`
```json
{
  "patient_id": 1,
  "medecin_prescripteur_id": null,
  "medecin_prescripteur_externe_nom": "",
  "medecin_prescripteur_externe_prenom": "",
  "date_demande": "2025-08-10",
  "note": "",
  "examens": [1, 2]
}
```
- **GET** `/exam-requests/{examRequest}`
- **PUT** `/exam-requests/{examRequest}`
```json
{
  "statut_demande": "En cours",
  "note": "Prélèvement effectué"
}
```
- **DELETE** `/exam-requests/{examRequest}`
- **GET** `/patients/{patient}/exam-requests`
- **GET** `/doctors/{doctor}/exam-requests`

### Paiements
- **GET** `/payments`
- **POST** `/payments`
```json
{
  "facture_id": 1,
  "date_paiement": "2025-08-10",
  "montant_paye": 45.5,
  "methode_paiement": "Caisse",
  "reference_paiement": "REC-2025-0001"
}
```
- **GET** `/payments/{payment}`
- **DELETE** `/payments/{payment}`
- **GET** `/patients/{patient}/payments`

### Factures
- **GET** `/invoices`
- **GET** `/invoices/{invoice}`
- **DELETE** `/invoices/{invoice}`
- **GET** `/patients/{patient}/invoices`
