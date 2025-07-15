import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, TrendingUp, Calendar, MapPin, Users } from 'lucide-react';
import { useFirebaseEvents } from '@/hooks/useFirebaseEvents';
import EventCard from './EventCard';
import InfiniteScroll from 'react-infinite-scroll-component';
import { motion } from 'framer-motion';

const ExplorePage = () => {
  const { events, loading } = useFirebaseEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [displayedEvents, setDisplayedEvents] = useState(events.slice(0, 6));
  const [hasMore, setHasMore] = useState(true);

  const categories = ['all', 'Technology', 'Cultural', 'Business', 'Sports', 'Academic', 'Social', 'Workshop', 'Conference'];
  const locations = ['all', 'Main Campus', 'Library', 'Student Center', 'Auditorium', 'Sports Complex'];

  useEffect(() => {
    let filtered = events.filter(event => new Date(event.eventDate) > new Date());

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Apply location filter
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(event => event.venue?.includes(selectedLocation));
    }

    // Apply sorting
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
        break;
      case 'popularity':
        filtered.sort((a, b) => {
          const aEngagement = (a.rsvp?.length || 0) + (a.likes?.length || 0);
          const bEngagement = (b.rsvp?.length || 0) + (b.likes?.length || 0);
          return bEngagement - aEngagement;
        });
        break;
      case 'trending':
        filtered.sort((a, b) => {
          const aScore = (a.rsvp?.length || 0) * 2 + (a.likes?.length || 0);
          const bScore = (b.rsvp?.length || 0) * 2 + (b.likes?.length || 0);
          return bScore - aScore;
        });
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setFilteredEvents(filtered);
    setDisplayedEvents(filtered.slice(0, 6));
    setHasMore(filtered.length > 6);
  }, [events, searchTerm, selectedCategory, selectedLocation, sortBy]);

  const loadMoreEvents = () => {
    const currentLength = displayedEvents.length;
    const nextEvents = filteredEvents.slice(currentLength, currentLength + 6);
    setDisplayedEvents([...displayedEvents, ...nextEvents]);
    setHasMore(currentLength + 6 < filteredEvents.length);
  };

  const getTrendingEvents = () => {
    return events
      .filter(event => new Date(event.eventDate) > new Date())
      .sort((a, b) => {
        const aScore = (a.rsvp?.length || 0) * 2 + (a.likes?.length || 0);
        const bScore = (b.rsvp?.length || 0) * 2 + (b.likes?.length || 0);
        return bScore - aScore;
      })
      .slice(0, 5);
  };

  const getUpcomingEvents = () => {
    return events
      .filter(event => new Date(event.eventDate) > new Date())
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      .slice(0, 5);
  };

  const getPopularCategories = () => {
    const categoryCount: { [key: string]: number } = {};
    events.forEach(event => {
      if (event.category) {
        categoryCount[event.category] = (categoryCount[event.category] || 0) + 1;
      }
    });
    
    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([category, count]) => ({ category, count }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Events
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing events happening on your campus
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location === 'all' ? 'All Locations' : location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <InfiniteScroll
                    dataLength={displayedEvents.length}
                    next={loadMoreEvents}
                    hasMore={hasMore}
                    loader={
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    }
                    endMessage={
                      <div className="text-center py-4 text-gray-500">
                        <p>You've seen all events!</p>
                      </div>
                    }
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {displayedEvents.map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <EventCard event={event} />
                        </motion.div>
                      ))}
                    </div>
                  </InfiniteScroll>
                )}
              </TabsContent>
              
              <TabsContent value="trending">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getTrendingEvents().map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <EventCard event={event} />
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="upcoming">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getUpcomingEvents().map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <EventCard event={event} />
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-white/80 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Events</span>
                    <span className="font-semibold text-blue-600">{events.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">This Week</span>
                    <span className="font-semibold text-purple-600">
                      {events.filter(e => {
                        const eventDate = new Date(e.eventDate);
                        const now = new Date();
                        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                        return eventDate >= now && eventDate <= weekFromNow;
                      }).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Categories</span>
                    <span className="font-semibold text-green-600">
                      {new Set(events.map(e => e.category).filter(Boolean)).size}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Popular Categories */}
            <Card className="bg-white/80 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg">Popular Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getPopularCategories().map(({ category, count }) => (
                    <div key={category} className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer hover:bg-blue-50"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Badge>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Featured Event */}
            {events.length > 0 && (
              <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Featured Event
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const featuredEvent = getTrendingEvents()[0];
                    return featuredEvent ? (
                      <div className="space-y-2">
                        <h4 className="font-semibold">{featuredEvent.title}</h4>
                        <div className="flex items-center text-sm opacity-90">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(featuredEvent.eventDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm opacity-90">
                          <MapPin className="w-4 h-4 mr-1" />
                          {featuredEvent.venue}
                        </div>
                        <div className="flex items-center text-sm opacity-90">
                          <Users className="w-4 h-4 mr-1" />
                          {featuredEvent.rsvp?.length || 0} attending
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm opacity-90">No featured events available</p>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;