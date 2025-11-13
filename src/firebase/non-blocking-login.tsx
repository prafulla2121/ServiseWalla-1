'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {
  setDocumentNonBlocking
} from './non-blocking-updates';
import {
  doc,
  getFirestore
} from 'firebase/firestore';

interface ToastFunction {
    ({
      title,
      description,
      variant,
    }: {
      title: string;
      description: string;
      variant?: 'default' | 'destructive';
    }): void;
}

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch((error) => {
    console.error("Anonymous sign-in error", error);
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, fullName: string, role: 'user' | 'worker', toast: ToastFunction, serviceId?: string): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then((userCredential) => {
      // After user is created, update their profile and save to Firestore
      const user = userCredential.user;
      if (user) {
        updateProfile(user, {
          displayName: fullName,
        });

        const [firstName, ...lastNameParts] = fullName.split(' ');
        const lastName = lastNameParts.join(' ');

        if (role === 'user') {
          const userDocRef = doc(getFirestore(authInstance.app), 'users', user.uid);
          const userData = {
            id: user.uid,
            firstName,
            lastName,
            email: user.email,
          };
          setDocumentNonBlocking(userDocRef, userData, { merge: false });
        } else if (role === 'worker') {
          const workerDocRef = doc(getFirestore(authInstance.app), 'workers', user.uid);
          const workerData = {
            id: user.uid,
            firstName,
            lastName,
            email: user.email,
            serviceIds: serviceId ? [serviceId] : [],
            bio: '',
          };
          setDocumentNonBlocking(workerDocRef, workerData, { merge: false });
        }
      }
    })
    .catch((error) => {
        let description = 'An unexpected error occurred. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
            description = 'This email is already registered. Please try logging in instead.';
        } else if (error.code === 'auth/weak-password') {
            description = 'The password is too weak. Please choose a stronger password.';
        }
        
        toast({
            variant: "destructive",
            title: "Registration Failed",
            description,
        });
        console.error("Email sign-up error", error);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, toast: ToastFunction): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .catch((error) => {
        let description = 'An unexpected error occurred. Please try again.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = 'Invalid email or password. Please check your credentials and try again.';
        }
        
        toast({
            variant: "destructive",
            title: "Sign-in Failed",
            description,
        });
        console.error("Email sign-in error", error);
  });
}
