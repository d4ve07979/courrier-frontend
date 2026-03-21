# Corrections du problème de chargement en boucle

Bro, pour une meilleure compréhension de ce problème, je vais te montrer comment je l'ai résolu.

## Problème identifié
La page `/courriers` se chargeait en boucle sans afficher les données du backend.

## Causes identifiées

### 1. **Dépendances du useEffect incorrectes**
- Le `useEffect` dépendait de l'objet `searchParams` entier
- Chaque modification de `searchParams` créait un nouvel objet, déclenchant un nouveau rendu
- Cela créait une boucle infinie de chargement

### 2. **Incohérence dans les noms de propriétés**
- Le type `Statut` utilise `libelle_statut` (backend)
- Le composant `CourrierCard` utilisait `nom_statut` (incorrect)
- Cela causait des erreurs d'affichage

### 3. **Problème d'authentification**
- Le backend retourne 403 (Forbidden) sans token JWT
- Incohérence entre `localStorage.getItem('token')` et `localStorage.getItem('access_token')`
- L'intercepteur axios cherchait `access_token` alors que AuthProvider utilise `token`

### 4. **Timeout trop court**
- `courrierApi.ts` avait un timeout de 5 secondes
- `axiosConfig.ts` avait un timeout de 30 secondes
- Incohérence pouvant causer des erreurs

## Corrections appliquées

### 1. Correction du useEffect (CourriersPage.tsx)
```typescript
// AVANT
useEffect(() => {
  loadCourriers();
}, [searchParams]);

// APRÈS
useEffect(() => {
  loadCourriers();
}, [searchParams.page, searchParams.size, searchParams.recherche, searchParams.statut, searchParams.type]);
```

### 2. Correction des noms de propriétés (CourrierCard.tsx)
```typescript
// AVANT
courrier.id_statut?.nom_statut

// APRÈS
courrier.id_statut?.libelle_statut
```

### 3. Correction de l'authentification (axiosConfig.ts)
```typescript
// AVANT
const token = localStorage.getItem('access_token');

// APRÈS
const token = localStorage.getItem('token') || localStorage.getItem('access_token');
```

### 4. Suppression du timeout personnalisé (courrierApi.ts)
```typescript
// AVANT
const response = await axiosInstance.get('/api/courriers/afficher', { 
  params,
  timeout: 5000
});

// APRÈS
const response = await axiosInstance.get('/api/courriers/afficher', { 
  params
});
```


## Fichiers modifiés

1. `src/pages/CourriersPage.tsx` - Correction du useEffect
2. `src/api/courrierApi.ts` - Suppression du timeout personnalisé
3. `src/api/axiosConfig.ts` - Correction de la récupération du token
4. `src/components/CourrierCard.tsx` - Correction des noms de propriétés

#  FIN 🔚 