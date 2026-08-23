# Mise à jour de la Base de Données Supabase

L'objectif est de synchroniser les données locales (produits, paramètres, avis) avec votre instance Supabase et de s'assurer que le schéma est correct.

## Actions Proposées

### 1. Préparation du Schéma SQL
Je vais vous fournir le script SQL complet à exécuter dans votre **SQL Editor** sur Supabase pour créer les tables nécessaires avec les bonnes politiques de sécurité (RLS).

### 2. Création d'un Script de Migration (Seed)
Je vais créer un fichier `src/services/seed.ts` qui utilise vos données de `initialData.ts` pour remplir la base de données.

### 3. Exécution de la Synchronisation
Je vais tenter d'exécuter ce script directement depuis l'environnement de développement pour mettre à jour votre base de données en temps réel.

## Tables à mettre à jour
- `products` : Toutes les créations Aziz Fashion.
- `store_settings` : Les informations de contact, WhatsApp et bannières.
- `reviews` : Les témoignages clients.
- `orders` : Structure pour accueillir les futures commandes.

## Questions Ouvertes
> [!IMPORTANT]
> Avez-vous déjà créé les tables sur votre instance Supabase ? Si oui, voulez-vous que je les écrase avec les données actuelles ou que j'ajoute seulement les nouveaux produits ?

## Plan de Vérification
### Manuelle
- Vérifier dans le tableau de bord Supabase que les lignes sont bien insérées.
- Recharger la boutique pour voir si les produits s'affichent depuis la DB (et non plus seulement depuis le fallback local).
