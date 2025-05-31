import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  query,
  where,
  collection,
  getDocs,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLew3ixW5fTSOBy6oFMb8U-t4UnF9cMBU",
  authDomain: "reviewuplift-378f0.firebaseapp.com",
  projectId: "reviewuplift-378f0",
  storageBucket: "reviewuplift-378f0.appspot.com",
  messagingSenderId: "149869204343",
  appId: "1:149869204343:web:0462b498a7b478186b8772",
  measurementId: "G-TS1H91W493"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const q = query(collection(db, "users"), where("email", "==", user.email));
  const existingUsers = await getDocs(q);

  if (!existingUsers.empty && existingUsers.docs[0].id !== user.uid) {
    throw new Error("Email already exists. Please log in using email and password.");
  }

  // const userRef = doc(db, "users", user.uid);
  // const userSnap = await getDoc(userRef);

  // if (!userSnap.exists()) {
  //   await setDoc(userRef, {
  //     uid: user.uid,
  //     email: user.email,
  //     displayName: user.displayName || "",
  //     role: "BUSER",
  //     createdAt: serverTimestamp(),
  //   });
  // }

  // return user;
};