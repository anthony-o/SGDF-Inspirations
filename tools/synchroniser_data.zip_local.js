const request = require('request');
const JSZip = require('jszip');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const FOLDER_NAMES_TO_HANDLE = ['ateliers', 'themes', 'tempsSpis', 'chants', 'benedicites', 'textes', 'typesTempsSpis', 'documents-simples'];

function handleErrorMessage(message) {
  return (error) => {
    console.error(message);
    console.error(error);
  }
}

// Création en mémoire du futur zip
const dataZip = new JSZip();

function handleJSZip(jsZip) {
  const filesToHandle = [];
  let handledFiles = 0;

  function addFilesToHandle(jsZipFolder) {
    // Lecture de chacun des dossiers racines correspondants aux types de documents
    for (let folderPathFromRoot of FOLDER_NAMES_TO_HANDLE) {
      jsZipFolder.folder(folderPathFromRoot).forEach((relativePath, file) => {
        // Chargement de chaque fichier dans une liste à traiter afin de gérer la fin du traitement des fichiers par la suite (comme c'est asynchrone)
        filesToHandle.push({folderPathFromRoot: folderPathFromRoot, relativePath: relativePath, file: file});
      });
    }
  }
  addFilesToHandle(jsZip);
  addFilesToHandle(jsZip.folder('Données application')); // pour traiter un zip créé à partir d'un téléchargement du Google Drive directement

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
                handleErrorMessage("Problème lors de l'écriture de data.zip.base64")(error);
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
    if (!relativePath.endsWith(".pdf")) {
      dataZip.file(folderPathFromRoot + '/' + relativePath, mdContent);
    }
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

  if (filesToHandle.length > 0) {
    // Traitement de chaque fichier
    for (let fileToHandle of filesToHandle) {
      const folderPathFromRoot = fileToHandle.folderPathFromRoot,
        relativePath = fileToHandle.relativePath,
        file = fileToHandle.file,
        handleErrorForThatFile = (error) => {
          handledFiles++;
          handleError(folderPathFromRoot, relativePath)(error);
        };

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
  } else {
    console.log("Aucun fichier détécté dans l'archive.");
  }
}

// Si un paramètre a été passé, il s'agit d'un fichier zip local, le traiter comme tel
const args = process.argv.slice(2); // merci à https://stackoverflow.com/a/5767589/535203
const dataZipFile = args[0];
if (dataZipFile) {
  // Traitement du data.zip local
  fs.readFile(dataZipFile, (error, zipData) => {
    if (error) {
      handleErrorMessage('Erreur lors de la lecture du fichier '+dataZipFile)(error);
    } else {
      // Lecture du zip
      JSZip.loadAsync(zipData).then(handleJSZip, handleErrorMessage('Erreur à la lecture du zip :'));
    }
  });
} else {
  // Récupération du Google Doc
  request('https://docs.google.com/document/d/1rtncxTc2mvGYXI6H9kGmQsJwW7IaTuFcqcvL9tM2e-4/export?format=txt', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("Google Doc récupéré, taille en octets : " + body.length);

      // Lecture du zip
      JSZip.loadAsync(body, {base64: true}).then(handleJSZip, handleErrorMessage('Erreur à la lecture du zip :'));
    } else {
      handleErrorMessage('Erreur à la réception du Google Doc :')(error);
    }
  });
}
