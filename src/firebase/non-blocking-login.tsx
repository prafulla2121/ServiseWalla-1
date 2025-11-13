
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
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
            photoURL: user.photoURL,
          };
          setDocumentNonBlocking(userDocRef, userData, { merge: false });
        } else if (role === 'worker') {
          const workerDocRef = doc(getFirestore(authInstance.app), 'workers', user.uid);
          const workerData = {
            id: user.uid,
            firstName,
            lastName,
            email: user.email,
            photoURL: user.photoURL,
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
        } else if (error.code === 'auth/invalid-email') {
            description = 'The email address is not valid. Please check and try again.';
        }
        
        toast({
            variant: "destructive",
            title: "Registration Failed",
            description,
        });
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, toast: ToastFunction): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .catch((error) => {
        let description = 'An unexpected error occurred. Please try again.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.code === 'auth/invalid-email') {
            description = 'Please enter a valid email address.';
        }
        
        toast({
            variant: "destructive",
            title: "Sign-in Failed",
            description,
        });
  });
}


/**
 * Sets up a RecaptchaVerifier instance for phone authentication.
 * It's attached to a container element in the DOM.
 */
export function setupRecaptcha(auth: Auth, containerId: string, toast: ToastFunction): void {
  try {
    // Check if verifier already exists to avoid re-rendering
    if ((window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier.clear();
    }
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      'size': 'invisible',
      'callback': (response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      },
      'expired-callback': () => {
        toast({
            variant: 'destructive',
            title: 'reCAPTCHA Expired',
            description: 'Please try sending the OTP again.',
        });
      }
    });
  } catch (error) {
    console.error("Recaptcha setup error:", error);
    toast({
        variant: 'destructive',
        title: 'reCAPTCHA Error',
        description: 'Could not initialize reCAPTCHA. Please refresh the page.',
    });
  }
}

/**
 * Initiates phone number sign-in and returns a confirmation result.
 */
export async function signInWithPhone(auth: Auth, phoneNumber: string): Promise<ConfirmationResult> {
  const appVerifier = (window as any).recaptchaVerifier;
  if (!appVerifier) {
    throw new Error("Recaptcha verifier not initialized.");
  }
  return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
}

/**
 * Confirms the OTP code and signs the user in.
 */
export async function confirmOtp(confirmationResult: ConfirmationResult, otp: string) {
    const userCredential = await confirmationResult.confirm(otp);
    const user = userCredential.user;

    // Check if the user is new. If so, create a corresponding document in Firestore.
    // This flow creates a 'user' profile by default. A worker can be created
    // through the dedicated worker registration flow.
    const db = getFirestore();
    const userDocRef = doc(db, 'users', user.uid);

    setDocumentNonBlocking(userDocRef, {
        id: user.uid,
        email: user.email, // Will be null for phone auth
        phone: user.phoneNumber,
        firstName: '', // No name provided in this flow yet
        lastName: '',
    }, { merge: true }); // Use merge to avoid overwriting existing data if user logs in via another method.
    
    return userCredential;
}
