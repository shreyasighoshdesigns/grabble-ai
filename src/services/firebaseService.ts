import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, serverTimestamp, Timestamp, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Screenshot, Board, Moodboard } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const createUserProfile = async (user: any) => {
  if (!user) return;
  const path = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);
  
  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      const userData: any = {
        email: user.email,
        displayName: user.displayName || '',
        createdAt: serverTimestamp()
      };
      if (user.photoURL) {
        userData.photoURL = user.photoURL;
      }
      await setDoc(userRef, userData);
    } else {
      // Only update fields that are allowed to change
      const updateData: any = {};
      if (user.displayName && user.displayName !== userSnap.data().displayName) {
        updateData.displayName = user.displayName;
      }
      if (user.photoURL && user.photoURL !== userSnap.data().photoURL) {
        updateData.photoURL = user.photoURL;
      }
      if (!userSnap.data().createdAt) {
        updateData.createdAt = serverTimestamp();
      }
      if (Object.keys(updateData).length > 0) {
        await setDoc(userRef, updateData, { merge: true });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const addScreenshot = async (userId: string, screenshot: Screenshot) => {
  const path = `users/${userId}/screenshots/${screenshot.id}`;
  const docRef = doc(db, `users/${userId}/screenshots`, screenshot.id);
  const cleanData = Object.fromEntries(Object.entries(screenshot).filter(([_, v]) => v !== undefined));
  try {
    await setDoc(docRef, cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateScreenshot = async (userId: string, screenshot: Screenshot) => {
  const path = `users/${userId}/screenshots/${screenshot.id}`;
  const docRef = doc(db, `users/${userId}/screenshots`, screenshot.id);
  const cleanData = Object.fromEntries(Object.entries(screenshot).filter(([_, v]) => v !== undefined));
  try {
    await setDoc(docRef, cleanData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteScreenshot = async (userId: string, screenshotId: string) => {
  const path = `users/${userId}/screenshots/${screenshotId}`;
  const docRef = doc(db, `users/${userId}/screenshots`, screenshotId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const getScreenshots = async (userId: string): Promise<Screenshot[]> => {
  const path = `users/${userId}/screenshots`;
  const q = query(
    collection(db, path),
    orderBy('dateAdded', 'desc')
  );
  
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Screenshot);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const addBoard = async (userId: string, board: Board) => {
  const path = `users/${userId}/boards/${board.id}`;
  const docRef = doc(db, `users/${userId}/boards`, board.id);
  const cleanData = Object.fromEntries(Object.entries(board).filter(([_, v]) => v !== undefined));
  try {
    await setDoc(docRef, cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateBoard = async (userId: string, board: Board) => {
  const path = `users/${userId}/boards/${board.id}`;
  const docRef = doc(db, `users/${userId}/boards`, board.id);
  const cleanData = Object.fromEntries(Object.entries(board).filter(([_, v]) => v !== undefined));
  try {
    await setDoc(docRef, cleanData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const getBoards = async (userId: string): Promise<Board[]> => {
  const path = `users/${userId}/boards`;
  try {
    const snapshot = await getDocs(collection(db, path));
    return snapshot.docs.map(doc => doc.data() as Board);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const deleteBoard = async (userId: string, boardId: string) => {
  const path = `users/${userId}/boards/${boardId}`;
  const docRef = doc(db, `users/${userId}/boards`, boardId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const addMoodboard = async (userId: string, moodboard: Moodboard) => {
  const path = `users/${userId}/moodboards/${moodboard.id}`;
  const docRef = doc(db, `users/${userId}/moodboards`, moodboard.id);
  const cleanData = Object.fromEntries(Object.entries(moodboard).filter(([_, v]) => v !== undefined));
  try {
    await setDoc(docRef, cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateMoodboard = async (userId: string, moodboard: Moodboard) => {
  const path = `users/${userId}/moodboards/${moodboard.id}`;
  const docRef = doc(db, `users/${userId}/moodboards`, moodboard.id);
  const cleanData = Object.fromEntries(Object.entries(moodboard).filter(([_, v]) => v !== undefined));
  try {
    await setDoc(docRef, cleanData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteMoodboard = async (userId: string, moodboardId: string) => {
  const path = `users/${userId}/moodboards/${moodboardId}`;
  const docRef = doc(db, `users/${userId}/moodboards`, moodboardId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const getMoodboards = async (userId: string): Promise<Moodboard[]> => {
  const path = `users/${userId}/moodboards`;
  try {
    const snapshot = await getDocs(collection(db, path));
    return snapshot.docs.map(doc => doc.data() as Moodboard);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

