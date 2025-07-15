import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Users, Calendar, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useFirebaseEvents } from '@/hooks/useFirebaseEvents';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const OrganizerAnalytics = () => {
  const { user } = useAuth();
  const { events } = useFirebaseEvents();
  const [timeRange, setTimeRange] = useState('30');
  const [organizerEvents, setOrganizerEvents] = useState(events.filter(e => e.organizerId === user?.uid));

  useEffect(() => {
    setOrganizerEvents(events.filter(e => e.organizerId === user?.uid));
  }, [events, user]);

  const getFilteredEvents = () => {
    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return organizerEvents.filter(event => 
      new Date(event.eventDate) >= cutoffDate
    );
  };

  const getEngagementData = () => {
    const filteredEvents = getFilteredEvents();
    
    return {
      labels: filteredEvents.map(event => event.title.substring(0, 20) + '...'),
      datasets: [
        {
          label: 'RSVPs',
          data: filteredEvents.map(event => event.rsvp?.length || 0),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
        {
          label: 'Likes',
          data: filteredEvents.map(event => event.likes?.length || 0),
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1,
        },
      ],
    };
  };

  const getTrendData = () => {
    const filteredEvents = getFilteredEvents();
    const eventsByDate: { [key: string]: { rsvps: number; likes: number } } = {};
    
    filteredEvents.forEach(event => {
      const date = new Date(event.eventDate).toLocaleDateString();
      if (!eventsByDate[date]) {
        eventsByDate[date] = { rsvps: 0, likes: 0 };
      }
      eventsByDate[date].rsvps += event.rsvp?.length || 0;
      eventsByDate[date].likes += event.likes?.length || 0;
    });

    const sortedDates = Object.keys(eventsByDate).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    return {
      labels: sortedDates,
      datasets: [
        {
          label: 'RSVPs Over Time',
          data: sortedDates.map(date => eventsByDate[date].rsvps),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Likes Over Time',
          data: sortedDates.map(date => eventsByDate[date].likes),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  const getCategoryData = () => {
    const categoryStats: { [key: string]: number } = {};
    organizerEvents.forEach(event => {
      if (event.category) {
        categoryStats[event.category] = (categoryStats[event.category] || 0) + 1;
      }
    });

    return {
      labels: Object.keys(categoryStats),
      datasets: [
        {
          data: Object.values(categoryStats),
          backgroundColor: [
            '#3B82F6',
            '#EF4444',
            '#10B981',
            '#F59E0B',
            '#8B5CF6',
            '#EC4899',
            '#6B7280',
          ],
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    };
  };

  const getOverallStats = () => {
    const totalRSVPs = organizerEvents.reduce((sum, event) => sum + (event.rsvp?.length || 0), 0);
    const totalLikes = organizerEvents.reduce((sum, event) => sum + (event.likes?.length || 0), 0);
    const avgRSVPs = organizerEvents.length > 0 ? Math.round(totalRSVPs / organizerEvents.length) : 0;
    const upcomingEvents = organizerEvents.filter(event => new Date(event.eventDate) > new Date()).length;

    return {
      totalEvents: organizerEvents.length,
      totalRSVPs,
      totalLikes,
      avgRSVPs,
      upcomingEvents,
    };
  };

  const stats = getOverallStats();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RSVPs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRSVPs}</div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLikes}</div>
            <p className="text-xs text-muted-foreground">Event engagement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg RSVPs</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRSVPs}</div>
            <p className="text-xs text-muted-foreground">Per event</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">Future events</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="engagement" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Event Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Bar data={getEngagementData()} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Line data={getTrendData()} options={lineChartOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Events by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center">
                <Doughnut data={getCategoryData()} options={doughnutOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Performing Events */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {organizerEvents
              .sort((a, b) => {
                const aEngagement = (a.rsvp?.length || 0) + (a.likes?.length || 0);
                const bEngagement = (b.rsvp?.length || 0) + (b.likes?.length || 0);
                return bEngagement - aEngagement;
              })
              .slice(0, 5)
              .map((event, index) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(event.eventDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center text-blue-600">
                      <Users className="w-4 h-4 mr-1" />
                      {event.rsvp?.length || 0}
                    </div>
                    <div className="flex items-center text-red-600">
                      <Heart className="w-4 h-4 mr-1" />
                      {event.likes?.length || 0}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizerAnalytics;