import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export interface Comment {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  likes: string[];
  replies?: Comment[];
}

export const useComments = (eventId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!eventId) return;

    const q = query(
      collection(db, 'comments'),
      where('eventId', '==', eventId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const commentsArray: Comment[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        commentsArray.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          likes: Array.isArray(data.likes) ? data.likes : [],
        } as Comment);
      });
      setComments(commentsArray);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [eventId]);

  const addComment = async (content: string, userId: string, userName: string, userAvatar?: string) => {
    try {
      await addDoc(collection(db, 'comments'), {
        eventId,
        userId,
        userName,
        userAvatar,
        content,
        createdAt: serverTimestamp(),
        likes: [],
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await deleteDoc(doc(db, 'comments', commentId));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      return { success: false, error: error.message };
    }
  };

  const likeComment = async (commentId: string, userId: string) => {
    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return { success: false };

      const isLiked = comment.likes.includes(userId);
      const newLikes = isLiked 
        ? comment.likes.filter(id => id !== userId)
        : [...comment.likes, userId];

      await updateDoc(doc(db, 'comments', commentId), {
        likes: newLikes
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error liking comment:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    comments,
    loading,
    addComment,
    deleteComment,
    likeComment
  };
};