-- 1. superadmins (sans company_id ni employe_id)
CREATE TABLE superadmins (
    superadmin_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telephone VARCHAR(50),
    sexe ENUM('M', 'F'),
    photo_de_profil VARCHAR(255),
    last_login DATETIME,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. companies
CREATE TABLE companies (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom_company VARCHAR(255) NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    contact VARCHAR(50) NOT NULL,
    logo VARCHAR(255),
    secteur_activite VARCHAR(100),
    type_etablissement ENUM('Public', 'Privé', 'Universitaire') NOT NULL,
    description TEXT
);

-- 3. permissions (pas de company_id ici)
CREATE TABLE permissions (
    permission_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    action VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL
);

-- 4. type_patients
CREATE TABLE type_patients (
    type_patient_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom_type VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
);

-- 5. medecins
CREATE TABLE medecins (
    medecin_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    date_naissance DATE NOT NULL,
    sexe ENUM('M', 'F') NOT NULL,
    contact VARCHAR(100) NOT NULL,
    numero_identification VARCHAR(100) NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
);

-- 6. patients (sans infos médecin externe)
CREATE TABLE patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    postnom VARCHAR(100),
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    date_naissance DATE NOT NULL,
    sexe ENUM('M', 'F') NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    contact VARCHAR(100) NOT NULL,
    type_patient_id INT NOT NULL,
    medecin_resident_id INT,
    FOREIGN KEY (company_id) REFERENCES companies(company_id),
    FOREIGN KEY (type_patient_id) REFERENCES type_patients(type_patient_id),
    FOREIGN KEY (medecin_resident_id) REFERENCES medecins(medecin_id)
);

-- 7. roles
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom_role VARCHAR(100) UNIQUE NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
);

-- 8. users (sans employe_id)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telephone VARCHAR(50),
    sexe ENUM('M', 'F'),
    photo_de_profil VARCHAR(255),
    last_login DATETIME,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
);

-- 9. user_roles
CREATE TABLE user_roles (
    user_role_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(company_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- 10. role_permissions
CREATE TABLE role_permissions (
    role_permission_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(company_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
);

-- 11. categorie_articles
CREATE TABLE categorie_articles (
    categorie_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom_categorie VARCHAR(100) UNIQUE NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
);

-- 12. articles
CREATE TABLE articles (
    article_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    categorie_id INT NOT NULL,
    nom_article VARCHAR(255) NOT NULL,
    description TEXT,
    fournisseur VARCHAR(255),
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    unite_mesure VARCHAR(50) NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(company_id),
    FOREIGN KEY (categorie_id) REFERENCES categorie_articles(categorie_id)
);

-- 13. stocks
CREATE TABLE stocks (
    stock_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    article_id INT NOT NULL,
    quantite_actuelle INT NOT NULL,
    seuil_critique INT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(company_id),
    FOREIGN KEY (article_id) REFERENCES articles(article_id)
);

-- 14. examens
CREATE TABLE examens (
    examen_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom_examen VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    prix DECIMAL(10, 2) NOT NULL,
    delai_rendu_estime INT NOT NULL,
    unites_mesure VARCHAR(50) NOT NULL,
    valeurs_reference TEXT NOT NULL,
    type_echantillon VARCHAR(100) NOT NULL,
    conditions_pre_analytiques TEXT NOT NULL,
    equipement_reactifs_necessaires TEXT,
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
);

-- 15. examen_articles
CREATE TABLE examen_articles (
    examen_article_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    examen_id INT NOT NULL,
    article_id INT NOT NULL,
    quantite_utilisee DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(company_id),
    FOREIGN KEY (examen_id) REFERENCES examens(examen_id),
    FOREIGN KEY (article_id) REFERENCES articles(article_id)
);

-- 16. demande_examens
CREATE TABLE demande_examens (
    demande_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    medecin_prescripteur_id INT,
    medecin_prescripteur_externe_nom VARCHAR(100),
    medecin_prescripteur_externe_prenom VARCHAR(100),
    date_demande DATETIME NOT NULL,
    statut_demande ENUM('En attente', 'En cours', 'Terminée', 'Annulée') NOT NULL,
    note TEXT,
    FOREIGN KEY (company_id) REFERENCES companies(company_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (medecin_prescripteur_id) REFERENCES medecins(medecin_id)
);

-- 17. demande_examen_details
CREATE TABLE demande_examen_details (
    demande_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    demande_id INT NOT NULL,
    examen_id INT NOT NULL,
    resultat TEXT,
    date_resultat DATETIME,
    FOREIGN KEY (company_id) REFERENCES companies(company_id),
    FOREIGN KEY (demande_id) REFERENCES demande_examens(demande_id) ON DELETE CASCADE,
    FOREIGN KEY (examen_id) REFERENCES examens(examen_id)
);

-- 18. mouvement_stocks
CREATE TABLE mouvement_stocks (
    mouvement_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    stock_id INT NOT NULL,
    date_mouvement DATETIME NOT NULL,
    quantite INT NOT NULL,
    type_mouvement ENUM('Entrée', 'Sortie') NOT NULL,
    demande_id INT,
    motif TEXT,
    FOREIGN KEY (company_id) REFERENCES companies(company_id),
    FOREIGN KEY (stock_id) REFERENCES stocks(stock_id),
    FOREIGN KEY (demande_id) REFERENCES demande_examens(demande_id)
);

-- 19. alerte_stocks
CREATE TABLE alerte_stocks (
    alerte_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    stock_id INT NOT NULL,
    date_alerte DATETIME NOT NULL,
    quantite_actuelle INT NOT NULL,
    seuil_critique INT NOT NULL,
    message_alerte TEXT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(company_id),
    FOREIGN KEY (stock_id) REFERENCES stocks(stock_id)
);

-- 20. factures
CREATE TABLE factures (
    facture_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    demande_id INT UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    date_facture DATETIME NOT NULL,
    montant_total DECIMAL(12, 2) NOT NULL,
    statut_facture ENUM('En attente de paiement', 'Payée', 'Annulée', 'Partiellement payée') NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(company_id),
    FOREIGN KEY (demande_id) REFERENCES demande_examens(demande_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);

-- 21. facture_details
CREATE TABLE facture_details (
    facture_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    facture_id INT NOT NULL,
    examen_id INT NOT NULL,
    prix_unitaire_facture DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(company_id),
    FOREIGN KEY (facture_id) REFERENCES factures(facture_id) ON DELETE CASCADE,
    FOREIGN KEY (examen_id) REFERENCES examens(examen_id)
);

-- 22. paiements
CREATE TABLE paiements (
    paiement_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    facture_id INT NOT NULL,
    date_paiement DATETIME NOT NULL,
    montant_paye DECIMAL(12, 2) NOT NULL,
    methode_paiement ENUM('Carte bancaire', 'Caisse', 'Assurance') NOT NULL,
    reference_paiement VARCHAR(100),
    FOREIGN KEY (company_id) REFERENCES companies(company_id),
    FOREIGN KEY (facture_id) REFERENCES factures(facture_id)
);

-- 23. employes
CREATE TABLE employes (
    employe_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    matricule VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    postnom VARCHAR(100),
    prenom VARCHAR(100) NOT NULL,
    date_naissance DATE NOT NULL,
    sexe ENUM('M', 'F') NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    contact VARCHAR(100) NOT NULL,
    poste VARCHAR(100) NOT NULL,
    service VARCHAR(100),
    date_embauche DATE NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
);

-- 24. horaire_employes
CREATE TABLE horaire_employes (
    horaire_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    employe_id INT NOT NULL,
    date_horaire DATE NOT NULL,
    type_horaire ENUM('Journalier', 'Par heure') NOT NULL,
    heure_debut TIME,
    heure_fin TIME,
    FOREIGN KEY (company_id) REFERENCES companies(company_id),
    FOREIGN KEY (employe_id) REFERENCES employes(employe_id) ON DELETE CASCADE
);

-- 25. presence_employes
CREATE TABLE presence_employes (
    presence_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    employe_id INT NOT NULL,
    date_presence DATE NOT NULL,
    heure_entree TIME NOT NULL,
    heure_sortie TIME,
    FOREIGN KEY (company_id) REFERENCES companies(company_id),
    FOREIGN KEY (employe_id) REFERENCES employes(employe_id) ON DELETE CASCADE
);

-- 26. system_audits
CREATE TABLE system_audits (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    user_id INT,
    action_type VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    action_details TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(company_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
