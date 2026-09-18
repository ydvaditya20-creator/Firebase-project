function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var base64Data = data.base64Data;
    var fileName = data.fileName;
    
    // 🟢 FIX: Base64 header ko nikalne ka sahi aur secure tareeka
    var base64ImageString = base64Data.split(',')[1];
    var contentType = base64Data.split(',')[0].match(/:(.*?);/)[1];
    
    // Bytes mein decode karke file blob banana
    var decodedData = Utilities.base64Decode(base64ImageString);
    var blob = Utilities.newBlob(decodedData, contentType, fileName);
    
    // Google Drive mein file save karna
    var file = DriveApp.createFile(blob);
    
    // Public View Access dena
    file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      url: file.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
