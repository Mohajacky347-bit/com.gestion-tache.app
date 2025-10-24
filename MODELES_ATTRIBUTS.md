# Mise à jour des modèles avec les attributs requis

## Résumé des changements

Les modèles de données ont été mis à jour pour inclure tous les attributs spécifiés dans les tables de base de données. Voici les détails des modifications :

## 1. Table Phase (idPhase, nom, description, ordre, dateDebutPrev, dateFinPrev, dateDebutReel, dateFinReel, statut)

**Fichier**: `src/models/phase.model.ts`

**Attributs ajoutés**:
- `idPhase`: Identifiant unique de la phase
- `nom`: Nom de la phase
- `description`: Description détaillée de la phase
- `ordre`: Ordre d'exécution de la phase
- `dateDebutPrev`: Date de début prévue
- `dateFinPrev`: Date de fin prévue
- `dateDebutReel`: Date de début réelle (optionnelle)
- `dateFinReel`: Date de fin réelle (optionnelle)
- `statut`: Statut de la phase (planifie, en_cours, termine, annule)

**Méthodes disponibles**:
- `findAll()`: Récupérer toutes les phases
- `findById()`: Récupérer une phase par ID
- `findByOrder()`: Récupérer une phase par ordre
- `create()`: Créer une nouvelle phase
- `update()`: Mettre à jour une phase
- `delete()`: Supprimer une phase

## 2. Table Tache (idTache, titre, description, priorite, dateDebutPrev, dateFinPrev, dateDebutReel, dateFinReel, statut, idPhase)

**Fichier**: `src/models/task.model.ts`

**Attributs ajoutés**:
- `idTache`: Identifiant unique de la tâche
- `titre`: Titre de la tâche
- `description`: Description détaillée de la tâche
- `priorite`: Priorité (basse, normale, haute, critique)
- `dateDebutPrev`: Date de début prévue
- `dateFinPrev`: Date de fin prévue
- `dateDebutReel`: Date de début réelle (optionnelle)
- `dateFinReel`: Date de fin réelle (optionnelle)
- `statut`: Statut de la tâche (planifie, en_cours, termine, annule, en_pause)
- `idPhase`: Référence vers la phase

**Méthodes disponibles**:
- `findAll()`: Récupérer toutes les tâches
- `findById()`: Récupérer une tâche par ID
- `findByPhase()`: Récupérer les tâches d'une phase
- `findByStatus()`: Récupérer les tâches par statut
- `create()`: Créer une nouvelle tâche
- `update()`: Mettre à jour une tâche
- `delete()`: Supprimer une tâche

## 3. Table AffectationEmploye (idAffectation, role, dateDebutAffectation, dateFinAffectation, idTache, idEmploye)

**Fichier**: `src/models/affectation.model.ts`

**Attributs ajoutés**:
- `idAffectation`: Identifiant unique de l'affectation
- `role`: Rôle de l'employé dans la tâche
- `dateDebutAffectation`: Date de début de l'affectation
- `dateFinAffectation`: Date de fin de l'affectation (optionnelle)
- `idTache`: Référence vers la tâche
- `idEmploye`: Référence vers l'employé

**Méthodes disponibles**:
- `findAll()`: Récupérer toutes les affectations
- `findById()`: Récupérer une affectation par ID
- `findByTask()`: Récupérer les affectations d'une tâche
- `findByEmployee()`: Récupérer les affectations d'un employé
- `findActiveByEmployee()`: Récupérer les affectations actives d'un employé
- `create()`: Créer une nouvelle affectation
- `update()`: Mettre à jour une affectation
- `delete()`: Supprimer une affectation
- `terminateAffectation()`: Terminer une affectation

## 4. Table Employe (idEmploye, nom, prenom, matricule, fonction, contact, specialite, disponibilite)

**Fichier**: `src/models/employee.model.ts`

**Attributs ajoutés**:
- `idEmploye`: Identifiant unique de l'employé
- `nom`: Nom de famille
- `prenom`: Prénom
- `matricule`: Numéro matricule (unique)
- `fonction`: Fonction dans l'entreprise
- `contact`: Informations de contact
- `specialite`: Spécialité technique
- `disponibilite`: Statut de disponibilité (disponible, affecte, absent)

**Méthodes disponibles**:
- `findAll()`: Récupérer tous les employés
- `findById()`: Récupérer un employé par ID
- `findByMatricule()`: Récupérer un employé par matricule
- `findBySpecialite()`: Récupérer les employés par spécialité
- `findByDisponibilite()`: Récupérer les employés par disponibilité
- `findAvailable()`: Récupérer les employés disponibles
- `search()`: Rechercher des employés par terme
- `create()`: Créer un nouvel employé
- `update()`: Mettre à jour un employé
- `updateDisponibilite()`: Mettre à jour la disponibilité
- `delete()`: Supprimer un employé

## 5. Table Absence (idAbsence, typeAbsence, dateDebut, dateFin, statut, raison, idEmploye)

**Fichier**: `src/models/absence.model.ts`

**Attributs ajoutés**:
- `idAbsence`: Identifiant unique de l'absence
- `typeAbsence`: Type d'absence (conge, maladie, formation, personnel, autre)
- `dateDebut`: Date de début de l'absence
- `dateFin`: Date de fin de l'absence (optionnelle)
- `statut`: Statut de l'absence (planifie, en_cours, termine, annule)
- `raison`: Raison de l'absence
- `idEmploye`: Référence vers l'employé

**Méthodes disponibles**:
- `findAll()`: Récupérer toutes les absences
- `findById()`: Récupérer une absence par ID
- `findByEmployee()`: Récupérer les absences d'un employé
- `findByType()`: Récupérer les absences par type
- `findByStatus()`: Récupérer les absences par statut
- `findCurrentAbsences()`: Récupérer les absences en cours
- `findAbsencesInPeriod()`: Récupérer les absences dans une période
- `create()`: Créer une nouvelle absence
- `update()`: Mettre à jour une absence
- `updateStatus()`: Mettre à jour le statut
- `terminateAbsence()`: Terminer une absence
- `delete()`: Supprimer une absence

## Base de données

**Fichier**: `database_schema.sql`

Un script SQL complet a été créé pour :
- Créer toutes les tables avec les bonnes contraintes
- Définir les relations entre les tables (clés étrangères)
- Créer les index pour optimiser les performances
- Insérer des données de test

## Fichier d'index

**Fichier**: `src/models/index.ts`

Un fichier d'index a été créé pour exporter tous les modèles, facilitant leur importation dans d'autres parties de l'application.

## Utilisation

```typescript
// Importer tous les modèles
import { phaseModel, taskModel, affectationModel, employeeModel, absenceModel } from '@/models';

// Ou importer individuellement
import { PhaseEntity, phaseModel } from '@/models/phase.model';
import { TaskEntity, taskModel } from '@/models/task.model';
```

## Relations entre les tables

1. **Phase → Tache**: Une phase peut contenir plusieurs tâches (1:N)
2. **Tache → AffectationEmploye**: Une tâche peut avoir plusieurs affectations (1:N)
3. **Employe → AffectationEmploye**: Un employé peut avoir plusieurs affectations (1:N)
4. **Employe → Absence**: Un employé peut avoir plusieurs absences (1:N)

Ces relations sont gérées par des clés étrangères dans la base de données et permettent de maintenir l'intégrité référentielle.
