// Ceci est un script Google App Scripts à exécuter dans Google Drive
function synchronizeDataZipBase64() {
  var rootFolder = DriveApp.getFolderById('1c6lvVufUv8Rf459_VArOfvsTqepyBHGo'),
    foldersIt = rootFolder.getFolders(),
    blobs = [],
    oauthToken = ScriptApp.getOAuthToken();
  while (foldersIt.hasNext()) {
    var subFolder = foldersIt.next(),
      subFilesIt = subFolder.getFiles();

    while (subFilesIt.hasNext()) {
      var file = subFilesIt.next(),
        fileBlob;
      if (file.getMimeType() == MimeType.GOOGLE_DOCS) { // 'application/vnd.google-apps.document'
        //fileBlob = file.getAs(MimeType.MICROSOFT_WORD); // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        // Merci à https://stackoverflow.com/a/29152127/535203 pour le lien d'export
        // Il fallait également activer "Drive" dans Resources > Advanced Google services https://developers.google.com/apps-script/guides/services/advanced#enabling_advanced_services
        var exportUrl = Drive.Files.get(file.getId()).exportLinks[MimeType.MICROSOFT_WORD],
          response = UrlFetchApp.fetch(exportUrl, {headers: {'Authorization': 'Bearer '+oauthToken}});
        fileBlob = response.getBlob().setName(file.getName()+'.docx');
      } else {
        fileBlob = file.getBlob();
      }
      blobs.push(fileBlob.setName(subFolder.getName()+'/'+fileBlob.getName()));
      //Logger.log(file.getName()+' -> '+file.getMimeType());//application/vnd.google-apps.document
    }
  }

  // Suppression de tous les fichiers data préalables
  /* Ceci ne fonctionne pas
  ['data.zip', 'data.zip.base64'].forEach(function(fileName) {
    var filesIt = rootFolder.getFilesByName(fileName);
    while (filesIt.hasNext()) {
      //Drive.Files.remove(filesIt.next().getId()); // Merci à https://stackoverflow.com/a/24226956/535203 pour vraiment supprimer un fichier
      //filesIt.next().setTrashed(true);
      //Drive.Files.remove(filesIt.next().getId(), {headers: {'Authorization': 'Bearer '+oauthToken}})
      DriveApp.removeFile(filesIt.next());
    }
  });
  */

  // Création du fichier zip + base64
  var zipBlob = Utilities.zip(blobs, 'data.zip');
  //rootFolder.createFile(zipBlob);
  var zipBase64Doc = DocumentApp.openById('1rtncxTc2mvGYXI6H9kGmQsJwW7IaTuFcqcvL9tM2e-4'); //DocumentApp.create('data.zip.base64');
  // Suppression du contenu actuel
  zipBase64Doc.getBody().clear();
  zipBase64Doc.getBody().appendParagraph(Utilities.base64Encode(zipBlob.getBytes())); // merci à https://developers.google.com/apps-script/reference/document/document#getcursor
  zipBase64Doc.saveAndClose();
  //rootFolder.createFile(zipBase64Doc.getBlob());
}
