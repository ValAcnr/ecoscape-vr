# 00 — DIAGNOSTIC EcoScape VR (partie Tech & Partenariats)

*Rédigé le 01/11/2026. Document de travail interne (en français) ; les livrables seront en anglais.*
*Tout ce qui est marqué ✅ a été vérifié en direct aujourd'hui (requête HTTP ou API). `[À VÉRIFIER]` = non confirmé.*

---

## 1.1 Environnement

### Ce qui est installé (vérifié sur la machine)

| Outil | État | Usage dans le projet |
|---|---|---|
| Node.js | ✅ v20.20.2 | Vite/React — suffisant |
| npm | ✅ 10.8.2 | suffit, **pnpm pas nécessaire** |
| Python | ✅ 3.12.3 | génération .xlsx / .docx si besoin |
| git | ✅ 2.43.0 | versioning |
| GitHub CLI (`gh`) | ✅ 2.96, connecté (compte ValAcnr) | création du dépôt + GitHub Pages |
| Chromium (Playwright) | ✅ navigateurs déjà en cache (chromium-1248) | captures d'écran, vidéo de démo |
| ffmpeg | ❌ absent du système (seul le ffmpeg interne de Playwright existe) | conversion vidéo WebM → MP4/GIF |
| pandoc | ❌ absent | export Markdown → .docx du rapport |
| LibreOffice | ❌ absent | facultatif : conversion .docx → PDF pour relecture |
| Vercel / Netlify CLI | ❌ absents | facultatifs (voir déploiement) |

Ressources machine : 2 CPU, 7,8 Go RAM, 36 Go libres — suffisant.

### À installer (je peux le faire dès ton feu vert)

```bash
apt-get install -y ffmpeg pandoc                          # indispensable (~150 Mo)
apt-get install -y --no-install-recommends libreoffice-writer   # facultatif (~400 Mo), pour prévisualiser le .docx en PDF
# Mermaid → PNG : via npx @mermaid-js/mermaid-cli (réutilise le Chromium déjà présent), rien à installer globalement
```

### Déploiement gratuit

| Option | Ce qu'il faut | Avis |
|---|---|---|
| **GitHub Pages** | rien de plus : `gh` est déjà connecté. Dépôt **public** obligatoire en offre gratuite. | **Recommandé** : zéro compte à créer, URL stable `https://<compte>.github.io/ecoscape-vr/`, HTTPS inclus (indispensable pour WebXR, géolocalisation et caméra). |
| Vercel | compte Vercel (connexion GitHub) + `npx vercel` | Très bien aussi, URL plus jolie, aperçu par branche. |
| Netlify | compte Netlify + `npx netlify-cli` | Équivalent à Vercel. |

⚠️ Décision à prendre par toi : **le dépôt sera public** (GitHub Pages gratuit). Ça veut dire que le code et les textes du prototype sont visibles. Pas de problème a priori pour un projet étudiant, mais je ne crée rien sur GitHub sans ton accord.

---

## 1.2 Ce qui est faisable, du plus simple au plus ambitieux

Estimations en temps de travail de ma part, ta part étant surtout relecture/choix/tests sur téléphone.

| Niveau | Rendu | Temps estimé | Risques | Apport au pitch |
|---|---|---|---|---|
| **N1 — Maquettes statiques** | 9 écrans mobile + 4 écrans VR en PNG/PDF haute fidélité | 2–3 jours | Faible. Risque « joli mais mort » à l'oral. | Couvre l'exigence du prof (maquettes parallèles) au minimum. |
| **N2 — Prototype cliquable** | Les mêmes écrans, navigables dans le navigateur | +1–2 jours | Faible | Démo fluide en soutenance, sans « vraie » logique. |
| **N3 — Prototype interactif web** | Vraie carte (MapLibre, données réelles des arbres/îlots de fraîcheur), mini-jeu jouable avec score, compteur 4/4 persistant, écran de déblocage, suivi, fil social, génération d'une image « story » partageable | +6–8 jours | Moyen : perf mobile de la carte, finition du mini-jeu. Maîtrisable. | **Fort** : le jury peut scanner le QR code et jouer sur son propre téléphone. C'est la preuve « zéro friction ». |
| **N4 — VR réelle (WebXR)** | Quartier en 3D + mini-jeu 3D ; bouton « Enter VR » sur Meta Quest (navigateur du casque), sinon contrôle souris/tactile | +5–7 jours | Moyen-élevé : **il faut un Quest pour tester** (tu en as un, ou quelqu'un de l'équipe ?). Sans casque, je ne peux valider que le fallback 3D. | Fort si on peut le montrer en direct ; sinon la vidéo suffit. |
| **N5 — AR « géolocalisée »** | Missions géolocalisées réelles + caméra | +4–6 jours | **Élevé** (voir ci-dessous) | Effet « waouh » mais fragile en démo. |

### Limites honnêtes du N5 (AR)
- **WebXR AR (`immersive-ar`) fonctionne sur Android + Chrome.**
- **iOS Safari ne supporte pas WebXR** (ni VR ni AR) à ce jour, et Apple n'a rien annoncé pour iOS ; seul Safari sur Vision Pro supporte la VR WebXR. Sources tierces de mai/juin 2026, pas d'annonce officielle WebKit trouvée → à citer prudemment dans le rapport.
- La **géolocalisation navigateur** (`navigator.geolocation`) marche partout en HTTPS, mais en salle de soutenance le GPS est imprécis et on n'est pas à Paris/NYC.
- **Fallback proposé** : carte 2D + **géofencing simulé** (un bouton « me téléporter au spot » ou un « mode démo » qui déplace le joueur sur la carte). C'est ce qu'on montre en soutenance ; la vraie géoloc reste disponible en option.
- La caméra en arrière-plan (sans WebXR) est possible sur iOS et Android (`getUserMedia`), donc un « faux AR » simple (plante en surimpression sur la vidéo caméra, sans ancrage au sol) est faisable partout. Je le classerais en bonus.

### Unity WebGL vs prototype web
- Le rapport annonce Unity. **Correction (01/11, après vérification) :** le manuel Unity 6.6 indique bien un support d'iOS Safari 15+ et de Chrome 58+ sur Android pour sa plateforme Web. L'argument n'est donc pas « Unity ne marche pas sur mobile », mais : une seule base de code web pour la carte, le mobile et la VR, une itération plus rapide sur le gameplay, et une ouverture instantanée depuis un QR code. Pour une démo « scanne et joue », le web natif (React + MapLibre + Three.js) reste le choix le plus réaliste.
- **Justification à écrire dans le rapport** : *« The web prototype is the MVP: it validates the gameplay loop and the zero-friction promise on any phone. Unity is the production target for the premium VR experience (richer physics, native Quest build, asset pipeline). »* Les deux ne se contredisent pas : même boucle de jeu, deux niveaux de rendu — ce qui colle exactement à la demande « mobile-web + VR premium ».
- Côté VR web, je recommande **React Three Fiber + @react-three/xr** plutôt qu'A-Frame : on reste dans un seul projet React avec la version mobile, et on partage données/config/état.

### Recommandation
**Niveau visé en ~4 semaines : N3 complet + N4 « léger » + N5 en fallback simulé.**

Ordre de construction :
1. Identité visuelle (2 directions, tu choisis) + design system → base commune.
2. Mobile-web N3 (la carte et le mini-jeu d'abord, c'est le cœur).
3. Page `/compare` + exports (captures, planche PDF) → le livrable du prof est sécurisé tôt.
4. VR N4 : hub, quartier 3D, mini-jeu 3D, déblocage — fallback souris/tactile d'abord, WebXR ensuite.
5. Déploiement + QR code + vidéo de démo.
6. En parallèle de 2–4 : section 3 du rapport et fichier partenaires (recherche, pas de code).

**Ce qui est trop ambitieux et que je déconseille** : un vrai back-end (comptes, base de données, modération du fil social, envoi réel aux associations). Tout sera **simulé côté navigateur** (données mockées réalistes + stockage local) ; l'architecture back-end sera *décrite* dans le rapport (section 3.2), pas construite. C'est normal pour un pitch.

---

## 1.3 Données réelles disponibles (liens vérifiés le 01/11/2026)

### Paris — Open Data Ville de Paris (opendata.paris.fr) ✅

| Jeu de données | URL | Format | Licence | Volume | Prototype ? |
|---|---|---|---|---|---|
| Arbres (patrimoine arboré) | https://opendata.paris.fr/explore/dataset/les-arbres/ | API JSON / GeoJSON / CSV | ODbL | 220 316 arbres, MAJ 30/10/2026 | ✅ Oui (extrait par quartier) |
| Arbres plantés (par projet) | https://opendata.paris.fr/explore/dataset/arbres-plantes-par-projet/ | idem | ODbL | 1 066 | ✅ Oui — parfait pour « plantations existantes » |
| Îlots de fraîcheur — espaces verts « frais » | https://opendata.paris.fr/explore/dataset/ilots-de-fraicheur-espaces-verts-frais/ | idem | ODbL | 984 | ✅ Oui |
| Îlots de fraîcheur — équipements/activités | https://opendata.paris.fr/explore/dataset/ilots-de-fraicheur-equipements-activites/ | idem | ODbL | 535 | ✅ Oui |
| Espaces verts et assimilés | https://opendata.paris.fr/explore/dataset/espaces_verts/ | idem | ODbL | 2 535 | ✅ Oui |
| Permis de végétaliser | https://opendata.paris.fr/explore/dataset/permis-de-vegetaliser/ | idem | ODbL | 1 732 | ✅ Oui — **angle « guerilla gardening » légal** : ces permis sont l'équivalent institutionnel (page explicative : https://www.paris.fr/pages/un-permis-pour-vegetaliser-paris-2689 ✅) |
| Jardins partagés | https://opendata.paris.fr/explore/dataset/jardins-partages/ | idem | ODbL | 189 | ✅ Oui — piste « potager comestible » + partenaires |
| Guide des essences de Paris (fiches) | https://opendata.paris.fr/explore/dataset/fiches-essences-du-guide-des-essences-de-paris/ | idem | ODbL | 200 fiches | ✅ Oui — **source réelle pour les règles du mini-jeu** (quelle essence pour quel milieu) |
| Indice de canopée | https://opendata.paris.fr/explore/dataset/indice-de-canopee/ | idem | Licence Ouverte (Etalab) | 6 lignes (agrégats) | ✅ Pour chiffres du rapport |
| Surface d'agriculture urbaine | https://opendata.paris.fr/explore/dataset/surface-d-agriculture-urbaine-dans-paris/ | idem | licence non renseignée dans les métadonnées `[À VÉRIFIER]` | 6 lignes | ⚠️ Chiffres seulement, citer la page |
| Votation mars 2025 « végétaliser 500 rues » | https://opendata.paris.fr/explore/dataset/votation-donnees-votation-mars2025-pour-ou-contre-vegetaliser-rues/ | idem | Licence Ouverte (Etalab) | 218 | ✅ Argument d'adhésion citoyenne pour le pitch |

**Chaleur à Paris :**
- **Cerema — Zones Climatiques Locales (LCZ)**, 93 territoires de +50 000 hab. dont Paris, données satellite 2022, MAJ 17/07/2026 : https://www.data.gouv.fr/datasets/cartographie-des-zones-climatiques-locales-lcz-des-93-territoires-de-plus-de-50-000-habitants-en-france ✅ — Licence Ouverte v2. **C'est la meilleure couche « zones chaudes » exploitable** pour la carte.
- **APUR** : portail open data (https://www.apur.org/en/open-data-maps/open-data, licence ODbL) et rapport sur les îlots de chaleur (https://www.apur.org/en/climate-environment/air-noise/urban-heat-islands-paris-intermediate-report). Je n'ai **pas** confirmé que la carte de thermographie d'été soit téléchargeable `[À VÉRIFIER]` → utilisable comme **référence dans le rapport**, pas comme donnée du prototype.
- **Météo-France** : données publiques sur https://meteo.data.gouv.fr/ ✅ (Licence Ouverte). Utile pour une ou deux statistiques de canicule dans le rapport ; pas nécessaire au prototype.

### New York — NYC Open Data ✅

| Jeu de données | URL | Licence | Prototype ? |
|---|---|---|---|
| 2015 Street Tree Census — Tree Data | https://data.cityofnewyork.us/d/uvpi-gqnh | Conditions d'utilisation NYC Open Data (pas de licence nommée dans les métadonnées ; usage libre selon les Terms of Use `[À VÉRIFIER formulation]`) | ✅ Oui. Attention : données de 2015 |
| Forestry Tree Points (NYC Parks, mis à jour en continu) | https://data.cityofnewyork.us/d/hn5i-inap | idem | ✅ Oui — plus récent que le recensement 2015 |
| Heat Vulnerability Index Rankings | https://data.cityofnewyork.us/d/4mhf-duep | idem | ✅ Oui (par code postal / quartier) |
| HVI — page explicative (NYC Health) | https://a816-dohbesp.nyc.gov/IndicatorPublic/data-features/hvi/ ✅ | — | Pour le rapport |

**Local Law 148 (2023)** ✅ — texte : https://intro.nyc/local-laws/2023-148. Elle impose un **Urban Forest Plan** visant à porter équitablement la canopée à **30 % du territoire**. Le plan a été publié en avril 2026 (Mayor's Office of Climate and Environmental Justice : https://climate.cityofnewyork.us/ufp_pr) ; il maintient 30 % mais **repousse l'échéance de 2030 à 2040**, et cite **23,4 % de canopée en 2021** (source : rapport du Comptroller, https://comptroller.nyc.gov/reports/new-york-citys-living-infrastructure-funding-and-managing-nycs-urban-forest-and-tree-canopy/). ⚠️ Certaines sources plus anciennes disent « 2035 » ou « 22 % » : on prendra les chiffres du plan 2026 et je revérifierai sur le document source avant de l'écrire dans le rapport.

### Fonds de carte et 3D

| Ressource | URL | Licence | Prototype ? |
|---|---|---|---|
| MapLibre GL JS | https://maplibre.org | BSD-3 | ✅ |
| OpenFreeMap (tuiles vectorielles gratuites, sans clé API) | https://openfreemap.org — style testé : https://tiles.openfreemap.org/styles/liberty ✅ | Données OSM (ODbL), attribution obligatoire | ✅ Oui. La couche bâtiments contient les hauteurs → **bâtiments 3D extrudés dans MapLibre** directement |
| OpenStreetMap | https://www.openstreetmap.org/copyright | ODbL — mention « © OpenStreetMap contributors » obligatoire | ✅ Pour exporter un extrait de bâtiments vers la scène VR |
| Tuiles officielles osm.org | https://operations.osmfoundation.org/policies/tiles/ ✅ | Usage lourd interdit | ❌ Ne pas les utiliser → OpenFreeMap à la place |

**Coût API : 0 €** sur toute la chaîne (pas de Mapbox, pas de Google Maps).

---

## 1.4 Risques et points d'attention

| Sujet | Risque | Parade |
|---|---|---|
| **Performance mobile** | Carte + 3D lourdes sur téléphone d'entrée de gamme | Données pré-découpées par quartier (fichiers JSON légers, pas l'API en direct), 3D low-poly, chargement de la VR uniquement à la demande |
| **Démo en direct** | Wi-Fi de l'école, GPS, casque qui ne se connecte pas | Mode démo hors-ligne (géofencing simulé) + **vidéo de secours** systématique |
| **Accessibilité** | Contrastes, petites polices, jeu uniquement gestuel | Contraste AA vérifié, taille de texte ≥ 16 px, toutes les actions du mini-jeu faisables au tap/clavier, pas d'information portée par la seule couleur (zones chaudes aussi en motif/libellé) |
| **RGPD / géolocalisation** | Position = donnée personnelle | Géoloc **optionnelle**, demandée au moment utile, jamais stockée ni envoyée (tout reste dans le navigateur) ; mention claire dans l'app. Dans le rapport : minimisation, consentement, floutage des positions dans le fil social. |
| **Photos de suivi / fil social** | Photos de personnes, modération | Prototype : photos de plantes uniquement (images libres ou générées) ; rapport : modération + signalement |
| **Coûts d'API** | Aucun (voir ci-dessus) | — |
| **Droits images/icônes/polices** | Utiliser une image sous droits | Uniquement : icônes **Lucide** (ISC), polices **Google Fonts** (OFL), illustrations/logo **créés par moi en SVG**, photos libres (Unsplash/Pexels licences notées, ou Wikimedia avec licence précise). Un fichier `CREDITS.md` listera chaque ressource et sa licence. |
| **Licence ODbL** | Attribution + partage à l'identique des bases dérivées | Mention « Ville de Paris — ODbL » et « © OpenStreetMap contributors » dans l'app et le rapport |
| **Marque / concept** | Ressemblance trop forte avec un jeu existant | Mécaniques inspirées du genre « jeu géolocalisé » (missions sur carte, collection) avec un univers et des visuels 100 % originaux ; on cite Pokémon Go comme *référence* dans le rapport, pas comme modèle visuel |
| **Ampleur du brief** | Rapport + partenaires + 13 écrans + VR + vidéo + déploiement : c'est beaucoup | Ordre ci-dessus pour que chaque semaine produise un livrable utilisable même si la suite glisse |

---

## Ce que j'attends de toi pour continuer

1. **Feu vert pour installer** `ffmpeg` + `pandoc` (et LibreOffice : oui/non ?).
2. **Déploiement** : GitHub Pages avec dépôt public sur le compte ValAcnr — d'accord ? (sinon Vercel avec ton compte)
3. **Casque** : as-tu (ou quelqu'un de l'équipe) accès à un Meta Quest pour tester le N4 ?
4. **Niveau visé** : tu valides « N3 complet + N4 léger + N5 simulé » ?
5. **Ordre des phases** : le brief dit Phase 2 (rapport) → 3 (partenaires) → 4 (prototype). Je propose de démarrer l'identité visuelle (4.1) tôt pour que tu choisisses pendant que je rédige la section 3. OK ?
