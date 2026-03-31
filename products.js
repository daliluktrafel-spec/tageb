// products.js — الآن سيكون فارغًا
// كل المنتجات ستُحمل من Firebase Realtime Database

let products = []; // قائمة المنتجات الفارغة

// دالة لتحميل المنتجات من Firebase
function loadProductsFromFirebase() {
    const productsRef = firebase.database().ref('products'); // مجلد المنتجات في Firebase
   productsRef.once('value', (snapshot) => {
        const data = snapshot.val();
        products = data ? Object.values(data) : [];
        // بعد تحميل المنتجات، نعيد عرضها في الصفحة
        renderCategories(); // إعادة عرض التصنيفات
        renderProducts("all"); // عرض كل المنتجات
    });
}

// استدعا الدالة عند تشغيل الصفحة
loadProductsFromFirebase();
