
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, Heart, MessageCircle, Share2, BookmarkPlus } from "lucide-react";

const EventFeed = () => {
  const sampleEvents = [
    {
      id: 1,
      title: "Tech Talk: AI in Healthcare",
      organizer: "Computer Science Club",
      organizerAvatar: "CS",
      date: "Nov 15, 2024",
      time: "2:00 PM",
      venue: "Main Auditorium",
      category: "Technology",
      attendees: 127,
      description: "Join us for an insightful discussion on how artificial intelligence is revolutionizing healthcare.",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=300&fit=crop",
      likes: 45,
      comments: 12,
      isLiked: false,
      tags: ["AI", "Healthcare", "Technology"]
    },
    {
      id: 2,
      title: "Cultural Night 2024",
      organizer: "International Students Association",
      organizerAvatar: "ISA",
      date: "Nov 20, 2024",
      time: "6:00 PM",
      venue: "Student Center",
      category: "Cultural",
      attendees: 234,
      description: "Celebrate diversity with performances, food, and cultural exhibitions from around the world.",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=300&fit=crop",
      likes: 89,
      comments: 23,
      isLiked: true,
      tags: ["Cultural", "Music", "Dance"]
    },
    {
      id: 3,
      title: "Startup Pitch Competition",
      organizer: "Entrepreneurship Club",
      organizerAvatar: "EC",
      date: "Nov 25, 2024",
      time: "10:00 AM",
      venue: "Innovation Hub",
      category: "Business",
      attendees: 156,
      description: "Present your startup ideas to industry experts and compete for a $5000 prize.",
      image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=500&h=300&fit=crop",
      likes: 67,
      comments: 18,
      isLiked: false,
      tags: ["Startup", "Business", "Competition"]
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {sampleEvents.map((event) => (
        <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white/80 backdrop-blur-sm border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                    {event.organizerAvatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{event.organizer}</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {event.category}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pb-4">
            {/* Event Image */}
            <div className="relative mb-4 rounded-lg overflow-hidden">
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 right-4">
                <Badge className="bg-black/50 text-white border-0">
                  <Users className="w-3 h-3 mr-1" />
                  {event.attendees}
                </Badge>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
              
              <p className="text-gray-600">{event.description}</p>

              <div className="flex flex-wrap gap-2 mb-3">
                {event.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>{event.date} at {event.time}</span>
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
                  className={`flex items-center gap-2 ${event.isLiked ? 'text-red-500' : 'text-gray-600'}`}
                >
                  <Heart className={`w-4 h-4 ${event.isLiked ? 'fill-current' : ''}`} />
                  {event.likes}
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                  {event.comments}
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <BookmarkPlus className="w-4 h-4" />
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  RSVP
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EventFeed;
