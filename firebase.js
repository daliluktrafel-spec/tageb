// firebase.js

const firebaseConfig = {
  apiKey: "AIzaSyAMEoUTIMAS0mh06_SxrM2T_efDxEmEoxg",
  authDomain: "wafaseiyunshop.firebaseapp.com",
  databaseURL: "https://wafaseiyunshop-default-rtdb.firebaseio.com",
  projectId: "wafaseiyunshop",
  storageBucket: "wafaseiyunshop.firebasestorage.app",
  messagingSenderId: "101115796279",
  appId: "1:101115796279:web:3753efad2a443c9b6098b2"
};

// منع التكرار عند تحميل الصفحة عدة مرات
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// متاح لكل الصفحات
window.database = firebase.database();
window.storage = firebase.storage();