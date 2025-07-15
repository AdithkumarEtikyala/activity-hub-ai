import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const uploadEventImage = async (file: File, eventId: string): Promise<string> => {
  try {
    const imageRef = ref(storage, `events/${eventId}/${file.name}`);
    const snapshot = await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const uploadUserAvatar = async (file: File, userId: string): Promise<string> => {
  try {
    const avatarRef = ref(storage, `avatars/${userId}/${file.name}`);
    const snapshot = await uploadBytes(avatarRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

export const deleteEventImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};