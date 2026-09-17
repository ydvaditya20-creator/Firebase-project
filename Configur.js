<script type="module">

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getDatabase,
    ref,
    push,
    limitToLast,
    query,
    get
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


const firebaseConfig = {
    apiKey: "AIzaSyDPcVvNNJZRVGF9SESynXtsZYwdJXB7J8U",
    authDomain: "shemacc-3ccac.firebaseapp.com",
    databaseURL: "https://shemacc-3ccac-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "shemacc-3ccac",
    storageBucket: "shemacc-3ccac.firebasestorage.app",
    messagingSenderId: "307019636811",
    appId: "1:307019636811:web:8f6ee756dbb7e756e8edce"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const database = getDatabase(app);


signInAnonymously(auth)
    .then(() => {
        console.log("Firebase connected");
    })
    .catch(error => {
        console.error(error);
    });


onAuthStateChanged(auth, user => {

    if (user) {
        console.log("UID:", user.uid);
    }

});

</script>
