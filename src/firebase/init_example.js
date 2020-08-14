import firebase from 'firebase';
import "firebase/auth";
import "firebase/database";
import "firebase/storage";


// Your web app's Firebase configuration
var firebaseConfig = {
    //Your Firebase Config
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
 // firebase.analytics()


  export default firebase;