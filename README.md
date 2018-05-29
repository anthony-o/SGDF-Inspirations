# SGDF-Inspirations

Application mobile qui permet aux chefs scouts (et tout animateur) de créer des temps spirituels (ou de réflexion) en proposant des contenus diverses d'animation ou d'inspiration.

## Installation pour le développement
Installer les dépendances suivantes :
- [Node.js](https://nodejs.org/en/) v8.x LTS
- [Yarn](https://yarnpkg.com/lang/en/docs/install/)
- [Ionic](https://ionicframework.com/docs/intro/installation/)

## Installation pour la création de binaires
### Android
Installer les dépendances suivantes (comme précisé dans la [documentation d'Ionic](https://ionicframework.com/docs/intro/deploying/)) :
- [Java JDK](http://www.oracle.com/technetwork/java/javase/downloads/index-jsp-138363.html) v8.x
- [Android Studio](https://developer.android.com/studio/index.html)
- Des outils Android SDK à jour, ainsi que les plateformes et composants nécessaires. Disponible via le [SDK Manager](https://developer.android.com/studio/intro/update.html) d'Android Studio

## Développement
Lancement de l'application en mode développement :
```bash
yarn ionic:serve
```

## Création de binaires
### Android
Dans le dossier racine du projet, lancer la commande suivante :
```bash
ionic cordova build android --prod --release
```
Le fichier `/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk` sera alors créé.
