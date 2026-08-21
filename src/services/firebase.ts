import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  deleteDoc, 
  collection, 
  query, 
  orderBy, 
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { EstimationRecord, UserProfile, NASA93Input } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentAuth = auth;
  const currentUser = currentAuth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with configured databaseId (MANDATORY)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Authentication
export const auth = getAuth(app);

// Connection test on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is offline or initializing.');
    }
    return false;
  }
}
testFirestoreConnection().catch(() => {});

// Authentication helpers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGoogle(): Promise<UserProfile | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    if (!fbUser) return null;

    const profile: UserProfile = {
      id: fbUser.uid,
      uid: fbUser.uid,
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Estimator',
      email: fbUser.email || '',
      photoUrl: fbUser.photoURL || undefined,
      role: 'lead',
      roleTitle: 'Principal Lead Estimator',
      roleTitleAr: 'كبير مقدري المشاريع',
    };

    // Sync profile to Firestore
    try {
      await setDoc(doc(db, 'users', fbUser.uid), {
        ...profile,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn('Could not sync user profile to firestore', err);
    }

    return profile;
  } catch (error: any) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  await fbSignOut(auth);
}

export function subscribeToAuth(callback: (user: UserProfile | null) => void) {
  return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      callback(null);
      return;
    }
    try {
      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        callback(data);
      } else {
        const defaultProfile: UserProfile = {
          id: fbUser.uid,
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Estimator',
          email: fbUser.email || '',
          photoUrl: fbUser.photoURL || undefined,
          role: 'lead',
          roleTitle: 'Principal Lead Estimator',
          roleTitleAr: 'كبير مقدري المشاريع',
        };
        callback(defaultProfile);
      }
    } catch {
      callback({
        id: fbUser.uid,
        uid: fbUser.uid,
        name: fbUser.displayName || 'Estimator',
        email: fbUser.email || '',
        photoUrl: fbUser.photoURL || undefined,
        role: 'lead',
        roleTitle: 'Principal Lead Estimator',
        roleTitleAr: 'كبير مقدري المشاريع',
      });
    }
  });
}

// Firestore Estimation Records Operations
export async function syncEstimationToFirestore(record: EstimationRecord): Promise<void> {
  const path = `estimations/${record.id}`;
  try {
    const payload = {
      ...record,
      userId: auth.currentUser?.uid || record.userId || 'anonymous',
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'estimations', record.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteEstimationFromFirestore(id: string): Promise<void> {
  const path = `estimations/${id}`;
  try {
    await deleteDoc(doc(db, 'estimations', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchEstimationsFromFirestore(): Promise<EstimationRecord[]> {
  const path = 'estimations';
  try {
    const q = query(collection(db, 'estimations'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as EstimationRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
