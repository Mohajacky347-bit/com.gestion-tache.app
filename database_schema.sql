-- Script de création des tables pour le système de gestion des tâches
-- Base de données: gestion_tache

-- Table des employés
CREATE TABLE IF NOT EXISTS employes (
    idEmploye VARCHAR(50) PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    matricule VARCHAR(20) UNIQUE NOT NULL,
    fonction VARCHAR(100) NOT NULL,
    contact VARCHAR(100) NOT NULL,
    specialite VARCHAR(100) NOT NULL,
    disponibilite ENUM('disponible', 'affecte', 'absent') DEFAULT 'disponible',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des phases
CREATE TABLE IF NOT EXISTS phases (
    idPhase VARCHAR(50) PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    ordre INT NOT NULL,
    dateDebutPrev DATE NOT NULL,
    dateFinPrev DATE NOT NULL,
    dateDebutReel DATE NULL,
    dateFinReel DATE NULL,
    statut ENUM('planifie', 'en_cours', 'termine', 'annule') DEFAULT 'planifie',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des tâches
CREATE TABLE IF NOT EXISTS taches (
    idTache VARCHAR(50) PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    priorite ENUM('basse', 'normale', 'haute', 'critique') DEFAULT 'normale',
    dateDebutPrev DATE NOT NULL,
    dateFinPrev DATE NOT NULL,
    dateDebutReel DATE NULL,
    dateFinReel DATE NULL,
    statut ENUM('planifie', 'en_cours', 'termine', 'annule', 'en_pause') DEFAULT 'planifie',
    idPhase VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idPhase) REFERENCES phases(idPhase) ON DELETE CASCADE
);

-- Table des affectations employés
CREATE TABLE IF NOT EXISTS affectations_employes (
    idAffectation VARCHAR(50) PRIMARY KEY,
    role VARCHAR(100) NOT NULL,
    dateDebutAffectation DATE NOT NULL,
    dateFinAffectation DATE NULL,
    idTache VARCHAR(50) NOT NULL,
    idEmploye VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idTache) REFERENCES taches(idTache) ON DELETE CASCADE,
    FOREIGN KEY (idEmploye) REFERENCES employes(idEmploye) ON DELETE CASCADE
);

-- Table des absences
CREATE TABLE IF NOT EXISTS absences (
    idAbsence VARCHAR(50) PRIMARY KEY,
    typeAbsence ENUM('conge', 'maladie', 'formation', 'personnel', 'autre') NOT NULL,
    dateDebut DATE NOT NULL,
    dateFin DATE NULL,
    statut ENUM('planifie', 'en_cours', 'termine', 'annule') DEFAULT 'planifie',
    raison TEXT NOT NULL,
    idEmploye VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idEmploye) REFERENCES employes(idEmploye) ON DELETE CASCADE
);

-- Table des matériels (existante, mise à jour si nécessaire)
CREATE TABLE IF NOT EXISTS materiels (
    id VARCHAR(50) PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    type VARCHAR(100) NOT NULL,
    quantite INT NOT NULL DEFAULT 1,
    etat ENUM('disponible', 'utilise', 'maintenance') DEFAULT 'disponible',
    tache_actuelle VARCHAR(50) NULL,
    date_maintenance DATE NULL,
    responsable VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_employes_matricule ON employes(matricule);
CREATE INDEX idx_employes_disponibilite ON employes(disponibilite);
CREATE INDEX idx_employes_specialite ON employes(specialite);

CREATE INDEX idx_phases_ordre ON phases(ordre);
CREATE INDEX idx_phases_statut ON phases(statut);

CREATE INDEX idx_taches_priorite ON taches(priorite);
CREATE INDEX idx_taches_statut ON taches(statut);
CREATE INDEX idx_taches_phase ON taches(idPhase);
CREATE INDEX idx_taches_dates ON taches(dateDebutPrev, dateFinPrev);

CREATE INDEX idx_affectations_employe ON affectations_employes(idEmploye);
CREATE INDEX idx_affectations_tache ON affectations_employes(idTache);
CREATE INDEX idx_affectations_dates ON affectations_employes(dateDebutAffectation, dateFinAffectation);

CREATE INDEX idx_absences_employe ON absences(idEmploye);
CREATE INDEX idx_absences_type ON absences(typeAbsence);
CREATE INDEX idx_absences_statut ON absences(statut);
CREATE INDEX idx_absences_dates ON absences(dateDebut, dateFin);

-- Données de test (optionnel)
INSERT IGNORE INTO phases (idPhase, nom, description, ordre, dateDebutPrev, dateFinPrev, statut) VALUES
('P001', 'Phase 1: Planification', 'Phase de planification des travaux', 1, '2025-01-01', '2025-01-15', 'termine'),
('P002', 'Phase 2: Exécution', 'Phase d\'exécution des travaux', 2, '2025-01-16', '2025-02-15', 'en_cours'),
('P003', 'Phase 3: Finalisation', 'Phase de finalisation et contrôle qualité', 3, '2025-02-16', '2025-02-28', 'planifie');

INSERT IGNORE INTO employes (idEmploye, nom, prenom, matricule, fonction, contact, specialite, disponibilite) VALUES
('E001', 'Rakoto', 'Jean', 'EMP001', 'Technicien voies', '0341234567', 'Voies ferrées', 'affecte'),
('E002', 'Rabe', 'Marie', 'EMP002', 'Électricien', '0341234568', 'Électricité', 'disponible'),
('E003', 'Andry', 'Paul', 'EMP003', 'Mécanicien', '0341234569', 'Mécanique', 'absent'),
('E004', 'Razafy', 'Hanta', 'EMP004', 'Chef d\'équipe', '0341234570', 'Management', 'affecte'),
('E005', 'Ratovo', 'Michel', 'EMP005', 'Inspecteur matériel', '0341234571', 'Inspection', 'disponible');
