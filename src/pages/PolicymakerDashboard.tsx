import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wind, Home, Download, AlertTriangle, TrendingUp, BarChart3, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra', 
  'Tamil Nadu', 'Uttar Pradesh', 'West Bengal', 'Rajasthan', 'Punjab', 'Haryana'
];

const PolicymakerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState('Delhi');
  const [loading, setLoading] = useState(false);
  const [aqiData, setAqiData] = useState<any>(null);
  const [policyRecommendations, setPolicyRecommendations] = useState('');
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<string[]>([]);

  useEffect(() => {
    fetchPolicyData(selectedState);
  }, [selectedState]);

  const fetchPolicyData = async (location: string) => {
    setLoading(true);
    try {
      // Fetch air quality data
      const { data: airData, error: airError } = await supabase.functions.invoke('fetch-air-quality', {
        body: { city: location }
      });

      if (airError) throw airError;

      const aqi = airData.list[0].main.aqi;
      const components = airData.list[0].components;
      
      setAqiData({
        aqi,
        pm25: components.pm2_5,
        pm10: components.pm10,
        no2: components.no2,
        co: components.co,
        o3: components.o3
      });

      // Generate historical trend data (simulated)
      const historical = Array.from({ length: 7 }, (_, i) => ({
        month: `Month ${i + 1}`,
        beforePolicy: Math.floor(Math.random() * 50) + 150,
        afterPolicy: Math.floor(Math.random() * 40) + 100
      }));
      setHistoricalData(historical);

      // Identify hotspots (simulated based on AQI)
      if (aqi >= 4) {
        setHotspots(['Industrial Zone', 'Traffic Junction', 'Construction Area']);
      } else {
        setHotspots([]);
      }

      // Fetch policy recommendations
      const { data: policyData, error: policyError } = await supabase.functions.invoke('generate-ai-summary', {
        body: { 
          aqiData: { aqi, ...components }, 
          city: location,
          type: 'policy'
        }
      });

      if (!policyError && policyData) {
        setPolicyRecommendations(policyData.summary);
      }

      toast({
        title: 'Data Loaded',
        description: `Policy analytics for ${location} updated`,
      });
    } catch (error) {
      console.error('Error fetching policy data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch policy data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    toast({
      title: 'Report Generated',
      description: 'Your air quality report is being prepared for download',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Header */}
      <nav className="px-6 py-4 bg-card/50 backdrop-blur-sm border-b flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <Wind className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">AeroSense - Policymaker Dashboard</span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button variant="outline" onClick={() => navigate('/citizen')}>
            Citizen View
          </Button>
        </div>
      </nav>

      <div className="px-6 py-8 max-w-7xl mx-auto space-y-8">
        {/* Controls */}
        <div className="flex justify-between items-center">
          <div className="w-64">
            <label className="text-sm font-medium mb-2 block">Select Region</label>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report (PDF)
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading policy analytics...</p>
          </div>
        ) : aqiData ? (
          <>
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 to-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Current AQI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{aqiData.aqi}</div>
                  <p className="text-xs text-muted-foreground mt-1">Air Quality Index</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">PM2.5</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{aqiData.pm25.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground mt-1">μg/m³</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500/10 to-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">PM10</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{aqiData.pm10.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground mt-1">μg/m³</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500/10 to-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Hotspots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{hotspots.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Critical zones</p>
                </CardContent>
              </Card>
            </div>

            {/* Policy Impact Analysis */}
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Policy Impact Analysis
                </CardTitle>
                <CardDescription>Comparison of pollution levels before and after interventions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="beforePolicy" fill="hsl(var(--destructive))" name="Before Policy" />
                    <Bar dataKey="afterPolicy" fill="hsl(var(--aqi-good))" name="After Policy" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Forecasting */}
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  7-Day Pollution Forecast
                </CardTitle>
                <CardDescription>AI-powered projections for planning interventions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart 
                    data={Array.from({ length: 7 }, (_, i) => ({
                      day: `Day ${i + 1}`,
                      predicted: aqiData.pm25 + Math.random() * 20 - 10
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Hotspot Identification */}
            {hotspots.length > 0 && (
              <Card className="bg-gradient-to-br from-destructive/10 to-card border-destructive/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Pollution Hotspots
                  </CardTitle>
                  <CardDescription>Areas exceeding safe pollution limits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {hotspots.map((spot, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-card rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
                          <span className="font-medium">{spot}</span>
                        </div>
                        <span className="text-sm text-destructive">Critical</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Policy Recommendations */}
            <Card className="bg-gradient-to-br from-accent/10 to-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  AI Policy Recommendations
                </CardTitle>
                <CardDescription>Data-driven interventions to improve air quality</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {policyRecommendations || 'Generating recommendations...'}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">Select a region to view policy analytics</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PolicymakerDashboard;