# Système d'Authentification

## Vue d'ensemble

Le système d'authentification a été ajouté à l'application de gestion des tâches pour permettre deux types d'utilisateurs :

- **Chef de Section** : Accès à l'interface complète de gestion (dashboard, tâches, employés, matériels, absences)
- **Chef de Brigade** : Interface spécifique pour consulter les tâches assignées et soumettre des rapports

## Fonctionnalités

### Authentification
- Page de connexion avec formulaire email/mot de passe/rôle
- Sélection du rôle (Chef de Section ou Chef de Brigade)
- Gestion de session avec localStorage
- Redirection automatique selon le rôle

### Interface Chef de Section
- **Dashboard** : Vue d'ensemble des activités
- **Gestion des Tâches** : Création, modification, attribution des tâches
- **Gestion des Employés** : Suivi du personnel
- **Gestion des Matériels** : Inventaire et suivi des équipements
- **Gestion des Absences** : Suivi des congés et absences

### Interface Chef de Brigade
- **Dashboard Brigade** : Vue d'ensemble des tâches assignées
- **Mes Tâches** : Liste des tâches avec filtres et recherche
- **Rapports** : Soumission de rapports avec upload de photos
- **Matériels** : Consultation des matériels liés aux tâches

## Structure des Fichiers

```
src/
├── contexts/
│   └── AuthContext.tsx          # Contexte d'authentification
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx   # Protection des routes
│   └── layout/
│       ├── BrigadeLayout.tsx    # Layout pour chef de brigade
│       └── BrigadeSidebar.tsx   # Sidebar pour chef de brigade
└── pages/
    ├── BrigadeDashboard.tsx     # Dashboard chef de brigade
    ├── BrigadeTasks.tsx         # Liste des tâches
    ├── BrigadeReports.tsx       # Gestion des rapports
    └── BrigadeMaterials.tsx     # Matériels de la brigade

app/
├── login/
│   └── page.tsx                 # Page de connexion
├── brigade/
│   ├── page.tsx                 # Dashboard brigade
│   ├── taches/
│   │   └── page.tsx             # Tâches de la brigade
│   ├── rapports/
│   │   └── page.tsx             # Rapports
│   └── materiels/
│       └── page.tsx             # Matériels de la brigade
└── providers.tsx                # Providers avec AuthProvider
```

## Utilisation

### Connexion
1. Accéder à `/login`
2. Saisir email et mot de passe
3. Sélectionner le rôle (Chef de Section ou Chef de Brigade)
4. Cliquer sur "Se connecter"

### Navigation
- **Chef de Section** : Accès à toutes les fonctionnalités via la sidebar
- **Chef de Brigade** : Interface dédiée avec navigation spécifique

### Déconnexion
- Bouton "Se déconnecter" dans la sidebar
- Redirection automatique vers la page de connexion

## Sécurité

### Protection des Routes
- Toutes les pages sont protégées par `ProtectedRoute`
- Redirection automatique si non authentifié
- Vérification des rôles pour l'accès aux pages

### Gestion des Sessions
- Stockage local de l'utilisateur connecté
- Persistance de la session au rechargement
- Déconnexion automatique si session invalide

## Données de Démonstration

Pour la démonstration, le système accepte n'importe quel email/mot de passe. En production, ceci devrait être remplacé par :
- Authentification via API backend
- Validation des identifiants
- Gestion des tokens JWT
- Cookies sécurisés

## Personnalisation

### Ajout de Nouveaux Rôles
1. Modifier le type `UserRole` dans `AuthContext.tsx`
2. Ajouter les options dans le formulaire de connexion
3. Créer les layouts et pages correspondants
4. Mettre à jour la protection des routes

### Modification des Permissions
- Modifier les `allowedRoles` dans les composants `ProtectedRoute`
- Adapter les interfaces selon les besoins

## Notes Techniques

- Utilisation de React Context pour la gestion d'état
- Protection côté client et serveur (middleware)
- Interface responsive et accessible
- Cohérence visuelle avec le design existant

