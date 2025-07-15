import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle, Trash2, Send } from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { formatDistanceToNow } from 'date-fns';

interface CommentSectionProps {
  eventId: string;
}

const CommentSection = ({ eventId }: CommentSectionProps) => {
  const { user } = useAuth();
  const { comments, loading, addComment, deleteComment, likeComment } = useComments(eventId);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await addComment(
        newComment.trim(),
        user.uid,
        user.displayName || 'Anonymous',
        user.photoURL
      );
      
      if (result.success) {
        setNewComment('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) return;
    await likeComment(commentId, user.uid);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    await deleteComment(commentId);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <MessageCircle className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
      </div>

      {/* Add Comment */}
      {user && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.photoURL} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm">
                  {user.displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="bg-gray-50">
              <CardContent className="pt-4">
                <div className="flex space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.userAvatar} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm">
                      {comment.userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm">{comment.userName}</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{comment.content}</p>
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikeComment(comment.id)}
                        className={`text-xs ${
                          user && comment.likes.includes(user.uid)
                            ? 'text-red-600'
                            : 'text-gray-500'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 mr-1 ${
                            user && comment.likes.includes(user.uid) ? 'fill-current' : ''
                          }`}
                        />
                        {comment.likes.length}
                      </Button>
                      {user && comment.userId === user.uid && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;