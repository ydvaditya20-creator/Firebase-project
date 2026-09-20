// 🔴 APNA FIREBASE DATABASE URL YAHA DALEIN (Last mein / zaroor lagayein)
const FIREBASE_DB_URL = "https://shemacc-3ccac-default-rtdb.asia-southeast1.firebasedatabase.app/";
//
function backgroundSyncFirebaseToDrive() {
  try {
    // 1. Firebase se sabhi transactions fetch karna
    var response = UrlFetchApp.fetch(FIREBASE_DB_URL + "transactions.json");
    var data = JSON.parse(response.getContentText());
    
    if (!data) return; // Agar koi data nahi hai toh wapas laut jao

    // 2. Pehla Loop: Location (basahi, natwa) ke liye
    for (var location in data) {
      var locationData = data[location];
      
      // 3. Doosra Loop: Location ke andar ki Transaction IDs ke liye
      for (var id in locationData) {
        var tx = locationData[id];
        
        // Agar billLinks array exist karta hai
        if (tx.billLinks && tx.billLinks.length > 0) {
          var updatedLinks = [];
          var isUpdated = false;

          for (var i = 0; i < tx.billLinks.length; i++) {
            var currentItem = tx.billLinks[i];

            // Check agar item ek Base64 string hai
            if (currentItem.indexOf("data:image") === 0 || currentItem.indexOf("data:application/pdf") === 0) {
              
              // Base64 ko safe image blob mein convert karna
              var splitData = currentItem.split(',');
              var contentType = currentItem.match(/:(.*?);/)[1];
              var decodedData = Utilities.base64Decode(splitData[1]);
              
              // 🔤 FILE NAME: Sirf Voucher Number + i (e.g., B-26-0001_0)
              var cleanVoucher = tx.voucher_no ? tx.voucher_no.replace(/[^a-zA-Z0-9-_]/g, '') : "UNKNOWN";
              var fileName = cleanVoucher + "_" + i; 
              
              var blob = Utilities.newBlob(decodedData, contentType, fileName);
              
              // 📂 FOLDER WISE STORAGE PATH GENERATION
              // Transaction Date se Month aur Year nikalna (e.g., September 2026)
              var txDate = tx.date ? new Date(tx.date) : new Date();
              var monthlyFolderName = Utilities.formatDate(txDate, "GMT+5:30", "MMMM yyyy");
              
              // Root Folder (transactions), Location Folder (basahi/natwa), aur Monthly Folder dhundhna ya banana
              var targetFolder = getOrCreateFolderStructure("transactions", location, monthlyFolderName);
              
              // 🔄 REPLACE LOGIC: Sirf is specific monthly folder mein check karega
              var existingFiles = targetFolder.getFilesByName(fileName);
              while (existingFiles.hasNext()) {
                var oldFile = existingFiles.next();
                oldFile.setTrashed(true); // Purani file delete karega
              }
              
              // Target monthly folder mein Nayi file save karke public permissions dena
              var file = targetFolder.createFile(blob);
              file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
              
              // Drive ka direct embed URL lena
              var driveUrl = file.getUrl().replace('/view?usp=drivesdk', '/preview').replace('/view', '/preview');
              
              updatedLinks.push(driveUrl);
              isUpdated = true;
            } else {
              // Agar pehle se hi link hai, toh waisa hi rakhna hai
              updatedLinks.push(currentItem);
            }
          }

          // 4. Firebase mein data update karna
          if (isUpdated) {
            var options = {
              "method": "patch",
              "contentType": "application/json",
              "payload": JSON.stringify({ "billLinks": updatedLinks })
            };
            UrlFetchApp.fetch(FIREBASE_DB_URL + "transactions/" + location + "/" + id + ".json", options);
            Logger.log("Successfully synced Voucher: " + tx.voucher_no + " in folder: transactions/" + location + "/" + monthlyFolderName);
          }
        }
      }
    }
  } catch (error) {
    Logger.log("Error in background sync: " + error.toString());
  }
}

// 📂 Helper Function: Nested folders (Root > Location > Month) ko check karke automatic banane ke liye
function getOrCreateFolderStructure(rootName, locationName, monthName) {
  var rootFolder;
  var rootIter = DriveApp.getFoldersByName(rootName);
  if (rootIter.hasNext()) {
    rootFolder = rootIter.next();
  } else {
    rootFolder = DriveApp.createFolder(rootName);
  }
  
  var locationFolder;
  var locIter = rootFolder.getFoldersByName(locationName);
  if (locIter.hasNext()) {
    locationFolder = locIter.next();
  } else {
    locationFolder = rootFolder.createFolder(locationName);
  }
  
  var monthFolder;
  var monthIter = locationFolder.getFoldersByName(monthName);
  if (monthIter.hasNext()) {
    monthFolder = monthIter.next();
  } else {
    monthFolder = locationFolder.createFolder(monthName);
  }
  
  return monthFolder;
}
