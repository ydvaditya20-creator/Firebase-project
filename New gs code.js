// 🔴 APNA FIREBASE DATABASE URL YAHA DALEIN (Last mein / zaroor lagayein)
const FIREBASE_DB_URL = "https://shemacc-3ccac-default-rtdb.asia-southeast1.firebasedatabase.app/";

// 🔴 APNA FIREBASE DATABASE URL YAHA DALEIN (Last mein / zaroor lagayein)

function backgroundSyncFirebaseToDrive() {
  try {
    // 1. Firebase se sabhi branches aur unke transactions fetch karna
    var response = UrlFetchApp.fetch(FIREBASE_DB_URL + "transactions.json");
    var branchesData = JSON.parse(response.getContentText());
    
    if (!branchesData) return; // Agar koi data nahi hai toh wapas laut jao

    // 2. Loop 1: Sabhi Branches par loop chalana (e.g., branch1, branch2)
    for (var branch in branchesData) {
      var branchTransactions = branchesData[branch];
      
      if (!branchTransactions) continue;

      // 3. Loop 2: Har branch ke andar ki Transactions (keys) par loop chalana
      for (var id in branchTransactions) {
        var tx = branchTransactions[id];
        
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
              
              // 🌟 FILE NAME KO SIMPLE BANAYA (Voucher No + Txn ID + Index)
              var vNo = tx.voucher_no ? tx.voucher_no : "NoVoucher";
              var fileName = vNo + "_" + i + "_" + id ; 
              
              var blob = Utilities.newBlob(decodedData, contentType, fileName);
              
              // Drive mein file save karke public permissions dena
              var file = DriveApp.createFile(blob);
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

          // 4. Agar koi bhi image convert hui hai, toh sahi Branch aur ID par PATCH bhejra
          if (isUpdated) {
            var options = {
              "method": "patch",
              "contentType": "application/json",
              "payload": JSON.stringify({ "billLinks": updatedLinks })
            };
            
            // URL badal gaya hai: transactions/{branch}/{id}.json
            var targetUrl = FIREBASE_DB_URL + "transactions/" + branch + "/" + id + ".json";
            UrlFetchApp.fetch(targetUrl, options);
            
            Logger.log("Successfully synced Branch: " + branch + " | Record ID: " + id);
          }
        }
      }
    }
  } catch (error) {
    Logger.log("Error in background sync: " + error.toString());
  }
}
