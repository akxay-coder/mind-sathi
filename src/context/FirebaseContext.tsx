import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testFirebaseConnection } from '../firebase';
import {
  CaseData,
  CounsellorAlert,
  DailyCheckInRecord,
  InterventionNote,
  UserProfile,
  MoodLevel,
} from '../types';
import {
  INITIAL_CASE,
  INITIAL_USER_PROFILE,
  INITIAL_CHECKINS,
  COUNSELLOR_CASES,
  INITIAL_ALERTS,
  INITIAL_INTERVENTIONS,
} from '../data/mockData';

export function normalizeAuthEmail(input: string): string {
  const trimmed = input.trim();
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }
  // Mobile phone number: strip non-digit characters
  const cleanDigits = trimmed.replace(/[^0-9]/g, '');
  if (cleanDigits.length >= 7) {
    return `${cleanDigits}@mindsaathi.app`;
  }
  const cleanAlpha = trimmed.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `${cleanAlpha || 'user'}@mindsaathi.app`;
}

interface FirebaseContextType {
  currentUser: FirebaseUser | null;
  authLoading: boolean;
  isFirebaseConnected: boolean;
  userRole: 'complainant' | 'counsellor';
  userProfile: UserProfile;
  cases: CaseData[];
  currentCase: CaseData;
  checkIns: DailyCheckInRecord[];
  alerts: CounsellorAlert[];
  interventions: InterventionNote[];
  loginWithGoogle: () => Promise<'complainant' | 'counsellor'>;
  signUpWithEmailOrPhone: (
    identifier: string,
    password: string,
    fullName: string,
    role?: 'complainant' | 'counsellor',
    caseId?: string
  ) => Promise<FirebaseUser>;
  signInWithEmailOrPhone: (
    identifier: string,
    password: string
  ) => Promise<{ user: FirebaseUser; role: 'complainant' | 'counsellor' }>;
  loginDemo: (role: 'complainant' | 'counsellor') => Promise<void>;
  logout: () => Promise<void>;
  saveDailyCheckIn: (record: Partial<DailyCheckInRecord>) => Promise<void>;
  updateUserProfile: (updated: Partial<UserProfile>) => Promise<void>;
  addInterventionNote: (caseId: string, note: string, actionTaken: string) => Promise<void>;
  resolveCounsellorAlert: (alertId: string, resolutionNotes: string) => Promise<void>;
  setUserRole: (role: 'complainant' | 'counsellor') => void;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'complainant' | 'counsellor'>('complainant');

  // Application Data States (synced with Firestore)
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [cases, setCases] = useState<CaseData[]>(COUNSELLOR_CASES);
  const [currentCase, setCurrentCase] = useState<CaseData>(INITIAL_CASE);
  const [checkIns, setCheckIns] = useState<DailyCheckInRecord[]>(INITIAL_CHECKINS);
  const [alerts, setAlerts] = useState<CounsellorAlert[]>(INITIAL_ALERTS);
  const [interventions, setInterventions] = useState<InterventionNote[]>(INITIAL_INTERVENTIONS);

  // 1. Mandatory Firestore Connection Validation on initial boot
  useEffect(() => {
    async function verifyConnection() {
      const connected = await testFirebaseConnection();
      setIsFirebaseConnected(connected);
    }
    verifyConnection();
  }, []);

  // 2. Listen for Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch or create user profile in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const snapshot = await getDoc(userDocRef);
          if (snapshot.exists()) {
            const data = snapshot.data() as any;
            setUserProfile((prev) => ({
              ...prev,
              name: data.name || user.displayName || prev.name,
              role: data.role || 'complainant',
              phone: data.phone || prev.phone,
              caseId: data.caseId || prev.caseId,
              contactPreference: data.contactPreference || prev.contactPreference,
              preferredTime: data.preferredTime || prev.preferredTime,
              language: data.language || prev.language,
            }));
            if (data.role === 'counsellor' || data.role === 'complainant') {
              setUserRole(data.role);
            } else {
              setUserRole('complainant');
            }
          } else {
            // New user registration in Firestore
            const initialDoc: Record<string, any> = {
              userId: user.uid,
              name: (user.displayName || 'Priya Sharma').slice(0, 100),
              email: (user.email || '').slice(0, 150),
              role: 'complainant',
              caseId: 'MSJE/NHAA/2026/0842',
              phone: '+91 98765 43210',
              age: 26,
              contactPreference: 'call',
              preferredTime: '10:00 AM - 1:00 PM',
              language: 'English',
              biometricEnabled: true,
              confidentialMode: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, initialDoc);
            setUserProfile((prev) => ({
              ...prev,
              name: user.displayName || prev.name,
            }));
          }
        } catch (err) {
          console.warn('Could not read user profile from Firestore:', err);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 3. Real-time Firestore synchronizers
  useEffect(() => {
    if (!currentUser) return;

    // A. Check-ins Listener
    const checkinsCol = collection(db, 'checkins');
    let qCheckins;
    if (userRole === 'counsellor') {
      qCheckins = query(checkinsCol);
    } else {
      qCheckins = query(checkinsCol, where('userId', '==', currentUser.uid));
    }

    const unsubCheckins = onSnapshot(
      qCheckins,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: DailyCheckInRecord[] = snapshot.docs.map((docSnap) => {
            const d = docSnap.data();
            return {
              id: docSnap.id,
              date: d.date || 'Today',
              mood: d.mood as MoodLevel,
              energyLevel: d.energyLevel || 3,
              sleepQuality: d.sleepQuality || 'fair',
              notes: d.notes || '',
              tags: d.tags || [],
              flaggedForCounsellor: Boolean(d.flaggedForCounsellor),
            };
          });
          setCheckIns(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'checkins');
      }
    );

    // B. Cases Listener
    const casesCol = collection(db, 'cases');
    const unsubCases = onSnapshot(
      casesCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedCases: CaseData[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }));
          setCases(loadedCases);
          const found = loadedCases.find((c) => c.caseNumber === userProfile.caseId) || loadedCases[0];
          if (found) setCurrentCase(found);
        }
      },
      (error) => {
        console.warn('Cases collection observation error (using cached):', error.message);
      }
    );

    // C. Alerts Listener
    const alertsCol = collection(db, 'alerts');
    const unsubAlerts = onSnapshot(
      alertsCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedAlerts: CounsellorAlert[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }));
          setAlerts(loadedAlerts);
        }
      },
      (error) => {
        console.warn('Alerts observation notice:', error.message);
      }
    );

    // D. Interventions Listener
    const interventionsCol = collection(db, 'interventions');
    const unsubInterventions = onSnapshot(
      interventionsCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedInterventions: InterventionNote[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }));
          setInterventions(loadedInterventions);
        }
      },
      (error) => {
        console.warn('Interventions observation notice:', error.message);
      }
    );

    return () => {
      unsubCheckins();
      unsubCases();
      unsubAlerts();
      unsubInterventions();
    };
  }, [currentUser, userRole, userProfile.caseId]);

  // Google Sign In
  const loginWithGoogle = async (): Promise<'complainant' | 'counsellor'> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setCurrentUser(result.user);
      let detectedRole: 'complainant' | 'counsellor' = 'complainant';
      const userDocRef = doc(db, 'users', result.user.uid);
      const snapshot = await getDoc(userDocRef);
      if (snapshot.exists()) {
        const data = snapshot.data() as any;
        if (data.role === 'counsellor' || data.role === 'complainant') {
          detectedRole = data.role;
          setUserRole(detectedRole);
        }
      }
      return detectedRole;
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      throw err;
    }
  };

  // Sign Up with Email or Mobile Number directly in Firebase Auth & Firestore
  const signUpWithEmailOrPhone = async (
    identifier: string,
    password: string,
    fullName: string,
    role?: 'complainant' | 'counsellor',
    caseId?: string
  ): Promise<FirebaseUser> => {
    // Every account created via signup is strictly of user type ('complainant') by default
    const userRole: 'complainant' | 'counsellor' = role === 'counsellor' ? 'counsellor' : 'complainant';
    const authEmail = normalizeAuthEmail(identifier);
    const userCred = await createUserWithEmailAndPassword(auth, authEmail, password);
    const user = userCred.user;

    // Update display name in Firebase Auth
    try {
      await updateProfile(user, { displayName: fullName });
    } catch (e) {
      console.warn('Profile displayName update notice:', e);
    }

    const isPhone = !identifier.includes('@');
    const displayPhone = isPhone ? identifier.trim() : '+91 98765 43210';
    const finalCaseId = caseId?.trim() || 'MSJE/NHAA/2026/0842';

    // Register user profile document in Firestore (/users/{userId})
    const userDocRef = doc(db, 'users', user.uid);
    const initialDoc: Record<string, any> = {
      userId: user.uid,
      name: (fullName || 'Priya Sharma').slice(0, 100),
      email: authEmail.slice(0, 150),
      role: userRole,
      caseId: finalCaseId.slice(0, 64),
      phone: displayPhone.slice(0, 30),
      age: 26,
      contactPreference: 'call',
      preferredTime: '10:00 AM - 1:00 PM',
      language: 'English',
      biometricEnabled: true,
      confidentialMode: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(userDocRef, initialDoc);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
    }

    setUserRole(userRole);
    setUserProfile((prev) => ({
      ...prev,
      name: fullName || prev.name,
      role: userRole,
      phone: displayPhone,
      caseId: finalCaseId,
    }));
    setCurrentUser(user);

    return user;
  };

  // Sign In with Email or Mobile Number directly in Firebase Auth & Firestore
  const signInWithEmailOrPhone = async (
    identifier: string,
    password: string
  ): Promise<{ user: FirebaseUser; role: 'complainant' | 'counsellor' }> => {
    const authEmail = normalizeAuthEmail(identifier);

    let userCred;
    try {
      userCred = await signInWithEmailAndPassword(auth, authEmail, password);
    } catch (authErr: any) {
      console.warn('Firebase signInWithEmailAndPassword code:', authErr?.code);

      // If user does not exist in Firebase Auth or invalid credentials:
      if (
        authErr.code === 'auth/user-not-found' ||
        authErr.code === 'auth/invalid-credential' ||
        authErr.code === 'auth/invalid-email'
      ) {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, authEmail);
          if (methods.length > 0) {
            const passErr: any = new Error('Incorrect password');
            passErr.code = 'auth/wrong-password';
            throw passErr;
          } else {
            const notFoundErr: any = new Error('Account not found');
            notFoundErr.code = 'auth/user-not-found';
            throw notFoundErr;
          }
        } catch (fetchErr: any) {
          if (fetchErr.code === 'auth/wrong-password') {
            throw fetchErr;
          }
          // Default to Account not found error
          const notFoundErr: any = new Error('Account not found');
          notFoundErr.code = 'auth/user-not-found';
          throw notFoundErr;
        }
      }
      throw authErr;
    }

    const user = userCred.user;

    // Check if the user document is set up in Firestore database
    const userDocRef = doc(db, 'users', user.uid);
    let snapshot;
    try {
      snapshot = await getDoc(userDocRef);
    } catch (docErr) {
      console.warn('Profile read warning on sign-in:', docErr);
    }

    if (!snapshot || !snapshot.exists()) {
      // The account is NOT set up in the database!
      await signOut(auth);
      setCurrentUser(null);
      const notFoundErr: any = new Error('Account not found');
      notFoundErr.code = 'auth/user-not-found';
      throw notFoundErr;
    }

    const data = snapshot.data() as any;
    let detectedRole: 'complainant' | 'counsellor' = 'complainant';
    if (data.role === 'counsellor' || data.role === 'complainant') {
      detectedRole = data.role;
      setUserRole(detectedRole);
    } else {
      setUserRole('complainant');
    }

    setUserProfile((prev) => ({
      ...prev,
      name: data.name || user.displayName || prev.name,
      role: detectedRole,
      phone: data.phone || prev.phone,
      caseId: data.caseId || prev.caseId,
      contactPreference: data.contactPreference || prev.contactPreference,
      preferredTime: data.preferredTime || prev.preferredTime,
      language: data.language || prev.language,
    }));

    setCurrentUser(user);
    return { user, role: detectedRole };
  };

  // Demo Sign-In
  const loginDemo = async (role: 'complainant' | 'counsellor') => {
    setUserRole(role);
    if (role === 'complainant') {
      setUserProfile(INITIAL_USER_PROFILE);
    } else {
      setUserProfile((prev) => ({
        ...prev,
        name: 'Dr. Ananya Sen',
        role: 'counsellor',
      }));
    }
  };

  const logout = async () => {
    try {
      if (currentUser) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn('Sign out notice:', err);
    } finally {
      setCurrentUser(null);
      setUserRole('complainant');
    }
  };

  // Save Daily Check-In to Firestore
  const saveDailyCheckIn = async (record: Partial<DailyCheckInRecord>) => {
    const newRecord: DailyCheckInRecord = {
      id: `chk-${Date.now()}`,
      date: record.date || 'Today',
      mood: record.mood || 'okay',
      energyLevel: record.energyLevel ?? 3,
      sleepQuality: record.sleepQuality || 'fair',
      notes: (record.notes || '').slice(0, 1000),
      tags: (record.tags || []).slice(0, 10),
      flaggedForCounsellor: Boolean(record.flaggedForCounsellor),
    };

    // Optimistic UI Update
    setCheckIns((prev) => [newRecord, ...prev]);

    if (currentUser) {
      const checkinPayload: Record<string, any> = {
        userId: currentUser.uid,
        caseId: userProfile.caseId.slice(0, 64),
        date: newRecord.date.slice(0, 50),
        mood: newRecord.mood,
        energyLevel: newRecord.energyLevel,
        sleepQuality: newRecord.sleepQuality,
        notes: newRecord.notes,
        tags: newRecord.tags,
        flaggedForCounsellor: newRecord.flaggedForCounsellor,
        createdAt: new Date().toISOString(),
      };

      try {
        await addDoc(collection(db, 'checkins'), checkinPayload);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'checkins');
      }

      // If very low mood, also flag alert in /alerts for counsellor
      if (record.mood === 'very_low' || record.flaggedForCounsellor) {
        try {
          const alertPayload = {
            caseId: userProfile.caseId.slice(0, 64),
            caseNumber: userProfile.caseId.slice(0, 64),
            complainantName: userProfile.name.slice(0, 100),
            severity: 'High',
            reason: record.notes ? `Flagged check-in: ${record.notes.slice(0, 400)}` : 'Very Low mood reported in daily check-in.',
            timestamp: 'Just now',
            status: 'Open',
            updatedAt: new Date().toISOString(),
          };
          await addDoc(collection(db, 'alerts'), alertPayload);
        } catch (err) {
          console.warn('Alert registration logged locally:', err);
        }
      }
    }
  };

  // Update Profile
  const updateUserProfile = async (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updated }));
    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const payload: Record<string, any> = {
          userId: currentUser.uid,
          name: (updated.name || userProfile.name).slice(0, 100),
          role: userRole,
          contactPreference: updated.contactPreference || userProfile.contactPreference,
          preferredTime: (updated.preferredTime || userProfile.preferredTime).slice(0, 100),
          language: (updated.language || userProfile.language).slice(0, 50),
          biometricEnabled: updated.biometricEnabled ?? userProfile.biometricEnabled,
          confidentialMode: updated.confidentialMode ?? userProfile.confidentialMode,
          updatedAt: new Date().toISOString(),
        };
        await updateDoc(userDocRef, payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
  };

  // Add Intervention Note (Counsellor)
  const addInterventionNote = async (caseId: string, note: string, actionTaken: string) => {
    const newNote: InterventionNote = {
      id: `int-${Date.now()}`,
      caseId,
      date: 'Today, Just now',
      counsellorName: userProfile.name || 'Dr. Ananya Sen',
      note,
      actionTaken: actionTaken || 'Scheduled follow-up and legal coordination.',
    };

    setInterventions((prev) => [newNote, ...prev]);

    if (currentUser) {
      try {
        await addDoc(collection(db, 'interventions'), {
          caseId: caseId.slice(0, 64),
          counsellorName: (userProfile.name || 'Dr. Ananya Sen').slice(0, 100),
          note: note.slice(0, 2000),
          actionTaken: (actionTaken || 'Scheduled follow-up').slice(0, 1000),
          date: 'Today, Just now',
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'interventions');
      }
    }
  };

  // Resolve Alert (Counsellor)
  const resolveCounsellorAlert = async (alertId: string, resolutionNotes: string) => {
    setAlerts((prev) =>
      prev.map((alt) =>
        alt.id === alertId
          ? {
              ...alt,
              status: 'Resolved',
              resolutionNotes: resolutionNotes || 'Resolved post counsellor review and victim check-in.',
            }
          : alt
      )
    );

    if (currentUser) {
      try {
        const alertDocRef = doc(db, 'alerts', alertId);
        await updateDoc(alertDocRef, {
          status: 'Resolved',
          resolutionNotes: (resolutionNotes || 'Resolved post counsellor review').slice(0, 1000),
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.warn('Alert update error in Firestore:', error);
      }
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        currentUser,
        authLoading,
        isFirebaseConnected,
        userRole,
        userProfile,
        cases,
        currentCase,
        checkIns,
        alerts,
        interventions,
        loginWithGoogle,
        signUpWithEmailOrPhone,
        signInWithEmailOrPhone,
        loginDemo,
        logout,
        saveDailyCheckIn,
        updateUserProfile,
        addInterventionNote,
        resolveCounsellorAlert,
        setUserRole,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
