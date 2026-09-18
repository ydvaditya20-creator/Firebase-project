// External HTML se aane waale request ko handle karne ke liye doPost use hota hai
function doPost(e) {
  try {
    // External HTML se bheja gaya data nikalna
    var data = JSON.parse(e.postData.contents);
    var base64Data = data.base64Data;
    var fileName = data.fileName;
    
    // Base64 data se content aur raw bytes alag karna
    var splitData = base64Data.split(',');
    var contentType = splitData[0].match(/:(.*?);/)[1];
    var rawData = splitData[1];
    
    var decodedData = Utilities.base64Decode(rawData);
    var blob = Utilities.newBlob(decodedData, contentType, fileName);
    
    // Google Drive mein file save karna
    var file = DriveApp.createFile(blob);
    
    // File ko public read access dena taaki link har jagah kaam kare
    file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    
    var fileUrl = file.getUrl();
    
    // External HTML ko wapas response bhejna
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      url: fileUrl
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
