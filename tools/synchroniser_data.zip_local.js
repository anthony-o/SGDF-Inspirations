const request = require('request');
const JSZip = require('jszip');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const FOLDER_NAMES_TO_HANDLE = ['ateliers', 'themes', 'tempsSpis', 'chants', 'gestes', 'textes', 'typesTempsSpis'];

function handleErrorMessage(message) {
  return error => {
    console.error(message);
    console.error(error);
  }
}

// Récupération du Google Doc
request('https://docs.google.com/document/d/1rtncxTc2mvGYXI6H9kGmQsJwW7IaTuFcqcvL9tM2e-4/export?format=txt', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log("Google Doc récupéré, taille en octets : " + body.length);

    // Création en mémoire du futur zip
    let dataZip = new JSZip();

    // Lecture du zip
    JSZip.loadAsync(body, {base64: true}).then(jsZip => {
      let filesToHandle = [],
        handledFiles = 0;

      // Lecture de chacun des dossiers racines correspondants aux types de documents
      for (let folderPathFromRoot of FOLDER_NAMES_TO_HANDLE) {
        jsZip.folder(folderPathFromRoot).forEach((relativePath, file) => {
          // Chargement de chaque fichier dans une liste à traiter afin de gérer la fin du traitement des fichiers par la suite (comme c'est asynchrone)
          filesToHandle.push({folderPathFromRoot: folderPathFromRoot, relativePath: relativePath, file: file});
        });
      }

      function afterReadingAllFiles() {
        console.log("Nombre de fichiers traités : " + handledFiles);
        // Écriture finale du zip généré grâce à https://stuk.github.io/jszip/documentation/howto/write_zip.html & https://stackoverflow.com/a/34838872/535203 & https://stackoverflow.com/a/6182519/535203
        dataZip.generateAsync({type: 'nodebuffer', streamFiles: true}).then(
          dataZipBuffer => {
            fs.writeFile(path.join(path.dirname(__filename), '../src/assets/data.zip'), dataZipBuffer, error => {
              if (error) {
                handleErrorMessage("Problème lors de l'écriture de data.zip")(error);
              } else {
                console.log("Fichier data.zip correctement créé à partir du Google Doc.");
                fs.writeFile(path.join(path.dirname(__filename), '../data.zip.base64'), dataZipBuffer.toString('base64'), error => {
                  if (error) {
                    handleErrorMessage("Problème lors de l'écriture de data.zip.base64")
                  } else {
                    console.log("Fichier data.zip.base64 correctement créé à partir du Google Doc.");
                  }
                });
              }
            });
          }, handleErrorMessage("Problème lors de la génération de data.zip")
        );
      }

      function handleFile(folderPathFromRoot, relativePath, mdContent) {
        dataZip.file(folderPathFromRoot + '/' + relativePath, mdContent);
        handledFiles++;
        if (filesToHandle.length == handledFiles) {
          afterReadingAllFiles();
        }
      }

      function handleError(folderPathFromRoot, relativePath) {
        return handleErrorMessage('Erreur pendant le traitement de "' + folderPathFromRoot + '/' + relativePath + '" :');
      }

      function handleMammothMessages(messages, folderPathFromRoot, relativePath) {
        if (messages.length) {
          console.log('Message de traitement mammoth du fichier "' + folderPathFromRoot + '/' + relativePath + '" :');
          for (let message of messages) {
            console.log(message);
          }
        }
      }

      // Traitement de chaque fichier
      for (let fileToHandle of filesToHandle) {
        let folderPathFromRoot = fileToHandle.folderPathFromRoot,
          relativePath = fileToHandle.relativePath,
          file = fileToHandle.file,
          handleErrorForThatFile = handleError(folderPathFromRoot, relativePath);

        if (relativePath.endsWith(".docx")) {
          let relativePathMd = relativePath.slice(0, -5); // on supprime le ".docx" de la fin grâce à https://stackoverflow.com/a/4250414/535203
          // Traitement des fichiers Word
          file.async('nodebuffer').then(nodebuffer => {
            if (relativePath.endsWith(".md.docx")) {
              // Un document Word dont le texte est formaté en Markdown : récupération du contenu brut
              mammoth.extractRawText({buffer: nodebuffer}).then(result => {
                handleMammothMessages(result.messages, folderPathFromRoot, relativePath);
                handleFile(folderPathFromRoot, relativePathMd, result.value);
              }, handleErrorForThatFile);
            } else {
              // Un document Word dont il faut convertir le contenu en Markdown
              mammoth.convertToMarkdown({buffer: nodebuffer}).then(result => {
                handleMammothMessages(result.messages, folderPathFromRoot, relativePath);
                handleFile(folderPathFromRoot, relativePathMd + '.md', result.value);
              }, handleErrorForThatFile);
            }
          }, handleErrorForThatFile);
        } else {
          // Il s'agit d'un fichier que l'on va interpréter comme un contenu texte simple
          file.async('text').then(textContent => {
            handleFile(folderPathFromRoot, relativePath, textContent);
          }, handleErrorForThatFile);
        }
      }

    }, function (error) {
      handleErrorMessage('Erreur à la lecture du zip :')(error);
    });
  } else {
    handleErrorMessage('Erreur à la réception du Google Doc :')(error);
  }
});
