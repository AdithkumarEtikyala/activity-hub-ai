import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  BookmarkPlus,
  ExternalLink,
  Bookmark,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useFirebaseEvents, FirebaseEvent } from '@/hooks/useFirebaseEvents';
import { useToast } from '@/hooks/use-toast';
import { createGoogleCalendarLink } from '@/lib/googleCalendar';
import { formatDistanceToNow } from 'date-fns';
import CommentSection from './CommentSection';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon
} from 'react-share';

interface EventCardProps {
  event: FirebaseEvent;
  showComments?: boolean;
}

const EventCard = ({ event, showComments = false }: EventCardProps) => {
  const { user } = useAuth();
  const { rsvpToEvent, cancelRsvp, likeEvent, unlikeEvent } = useFirebaseEvents();
  const { toast } = useToast();
  const [showCommentsSection, setShowCommentsSection] = useState(showComments);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const userHasRsvpd = user && event.rsvp && Array.isArray(event.rsvp) && event.rsvp.includes(user.uid);
  const userHasLiked = user && event.likes && Array.isArray(event.likes) && event.likes.includes(user.uid);
  const isPopular = (event.rsvp?.length || 0) + (event.likes?.length || 0) > 10;
  const isTrending = (event.rsvp?.length || 0) > 5 && (event.likes?.length || 0) > 3;

  const handleRSVP = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to RSVP to events",
        variant: "destructive"
      });
      return;
    }

    try {
      if (userHasRsvpd) {
        const result = await cancelRsvp(event.id, user.uid);
        if (result.success) {
          toast({
            title: "RSVP Cancelled",
            description: "You've successfully cancelled your RSVP",
          });
        }
      } else {
        const result = await rsvpToEvent(event.id, user.uid);
        if (result.success) {
          toast({
            title: "Success!",
            description: "You've successfully RSVP'd to this event",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like events",
        variant: "destructive"
      });
      return;
    }

    try {
      if (userHasLiked) {
        await unlikeEvent(event.id, user.uid);
      } else {
        await likeEvent(event.id, user.uid);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Event Unsaved" : "Event Saved",
      description: isSaved ? "Event removed from saved events" : "Event saved to your collection",
    });
  };

  const handleAddToCalendar = () => {
    const calendarLink = createGoogleCalendarLink(event);
    window.open(calendarLink, '_blank');
  };

  const shareUrl = `${window.location.origin}/event/${event.id}`;
  const shareTitle = `Check out this event: ${event.title}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                  {event.title.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">Event Organizer</p>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(event.eventDate), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isTrending && (
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Trending
                </Badge>
              )}
              {isPopular && (
                <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                  Popular
                </Badge>
              )}
              {event.category && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {event.category}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          {/* Event Image */}
          {event.imageUrl && (
            <div className="relative mb-4 rounded-lg overflow-hidden">
              <img 
                src={event.imageUrl} 
                alt={event.title}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 right-4">
                <Badge className="bg-black/50 text-white border-0">
                  <Users className="w-3 h-3 mr-1" />
                  {(event.rsvp && Array.isArray(event.rsvp)) ? event.rsvp.length : 0}
                </Badge>
              </div>
            </div>
          )}

          {/* Event Details */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
            
            <p className="text-gray-600">{event.description}</p>

            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {event.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>{new Date(event.eventDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>{event.venue}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center gap-2 ${userHasLiked ? 'text-red-600' : 'text-gray-600'}`}
                onClick={handleLike}
              >
                <Heart className={`w-4 h-4 ${userHasLiked ? 'fill-current' : ''}`} />
                {(event.likes && Array.isArray(event.likes)) ? event.likes.length : 0}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 text-gray-600"
                onClick={() => setShowCommentsSection(!showCommentsSection)}
              >
                <MessageCircle className="w-4 h-4" />
                Comments
              </Button>
              
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2 text-gray-600"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                
                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border p-2 z-10"
                    >
                      <div className="flex space-x-2">
                        <FacebookShareButton url={shareUrl} quote={shareTitle}>
                          <FacebookIcon size={32} round />
                        </FacebookShareButton>
                        <TwitterShareButton url={shareUrl} title={shareTitle}>
                          <TwitterIcon size={32} round />
                        </TwitterShareButton>
                        <WhatsappShareButton url={shareUrl} title={shareTitle}>
                          <WhatsappIcon size={32} round />
                        </WhatsappShareButton>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-gray-600 ${isSaved ? 'text-blue-600' : ''}`}
                onClick={handleSave}
              >
                {isSaved ? <Bookmark className="w-4 h-4 fill-current" /> : <BookmarkPlus className="w-4 h-4" />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600"
                onClick={handleAddToCalendar}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              
              <Button 
                size="sm" 
                className={`${
                  userHasRsvpd 
                    ? 'bg-gray-500 hover:bg-gray-600' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                }`}
                onClick={handleRSVP}
                disabled={!user}
              >
                {!user ? 'Sign in to RSVP' : userHasRsvpd ? 'Cancel RSVP' : 'RSVP'}
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {showCommentsSection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-100"
              >
                <CommentSection eventId={event.id} />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EventCard;