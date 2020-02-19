const firebase = require('firebase/app');
require('firebase/auth');
require("firebase/firestore");

const config = {
    apiKey: "",
    authDomain: "dankmemes-44799.firebaseapp.com",
    databaseURL: "https://dankmemes-44799.firebaseio.com",
    projectId: "dankmemes-44799",
    storageBucket: "dankmemes-44799.appspot.com",
    messagingSenderId: "540521215996"
};



firebase.initializeApp(config);
let db = firebase.firestore();
db.settings({timestampsInSnapshots: true})
let auth = firebase.auth();
export default {
    firestore: db,
    auth: auth
};
