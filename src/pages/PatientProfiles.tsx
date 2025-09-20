import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, User, Calendar, Phone, MapPin, ArrowLeft, Loader2, AlertCircle, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PrakritiAnalysis from "@/components/analysis/PrakritiAnalysis";
import DiseaseAnalysis from "@/components/analysis/DiseaseAnalysis";
import PatientSummary from "@/components/analysis/PatientSummary";
import AddPatientForm from "@/components/forms/AddPatientForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, Patient, PrakritiAnalysis as PrakritiAnalysisType, DiseaseAnalysis as DiseaseAnalysisType, PatientSummary as PatientSummaryType } from "@/services/api";

const PatientProfiles = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [currentView, setCurrentView] = useState("list"); // list, add, prakriti, disease, summary
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prakritiData, setPrakritiData] = useState<PrakritiAnalysisType | null>(null);
  const [diseaseData, setDiseaseData] = useState<DiseaseAnalysisType[]>([]);
  const [patientSummary, setPatientSummary] = useState<PatientSummaryType | null>(null);

  // Debug authentication
  console.log('🔐 Auth Debug - user:', user);
  console.log('🔐 Auth Debug - isAuthenticated:', isAuthenticated);
  console.log('🔐 Auth Debug - authLoading:', authLoading);

  // Load patients on component mount
  useEffect(() => {
    console.log('🔐 Auth Debug - useEffect triggered:');
    console.log('  - isAuthenticated:', isAuthenticated);
    console.log('  - authLoading:', authLoading);
    console.log('  - user:', user);

    if (isAuthenticated && !authLoading) {
      console.log('✅ Conditions met, loading patients...');
      loadPatients();
    } else {
      console.log('❌ Conditions not met, not loading patients');
    }
  }, [isAuthenticated, authLoading]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Loading patients...');
      const data = await apiClient.getPatients();
      console.log('📊 Patients data received:', data);
      console.log('📊 Data type:', typeof data);
      console.log('📊 Data keys:', Object.keys(data));
      console.log('📊 Results:', data.results);
      console.log('📊 Count:', data.count);

      // Handle paginated response
      const patientsList = data.results || data || [];
      console.log('📋 Processed patients list:', patientsList);
      console.log('📋 Patients list length:', Array.isArray(patientsList) ? patientsList.length : 0);

      if (Array.isArray(patientsList)) {
        setPatients(patientsList);
        console.log('✅ Patients set successfully:', patientsList.length, 'patients');
      } else {
        console.error('❌ Patients list is not an array:', patientsList);
        setPatients([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load patients');
      console.error('❌ Error loading patients:', err);
      setPatients([]); // Ensure patients is always an array
    } finally {
      setLoading(false);
    }
  };

  const loadPatientSummary = async (patientId: number) => {
    try {
      setLoading(true);
      const summary = await apiClient.getPatientSummary(patientId);
      setPatientSummary(summary);
      setPrakritiData(summary.prakriti_analysis || null);
      setDiseaseData(Array.isArray(summary.active_diseases) ? summary.active_diseases : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load patient summary');
      console.error('Error loading patient summary:', err);
      setDiseaseData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPrakritiAnalyses = async (patientId: number) => {
    try {
      const data = await apiClient.getPrakritiAnalyses(patientId);
      const analyses = data.results || [];
      if (Array.isArray(analyses) && analyses.length > 0) {
        setPrakritiData(analyses[0]); // Get the latest analysis
      }
    } catch (err: any) {
      console.error('Error loading Prakriti analyses:', err);
    }
  };

  const loadDiseaseAnalyses = async (patientId: number) => {
    try {
      const data = await apiClient.getDiseaseAnalyses(patientId);
      const analyses = data.results || [];
      setDiseaseData(Array.isArray(analyses) ? analyses : []);
    } catch (err: any) {
      console.error('Error loading disease analyses:', err);
      setDiseaseData([]);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const filteredPatients = (patients || []).filter(patient =>
    patient.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug filtered patients
  console.log('🔍 Debug filteredPatients:');
  console.log('  - Original patients:', patients);
  console.log('  - Patients length:', patients?.length || 0);
  console.log('  - Search term:', searchTerm);
  console.log('  - Filtered patients:', filteredPatients);
  console.log('  - Filtered length:', filteredPatients.length);
  console.log('🔍 Debug - error:', error);

  const handleAddPatient = async (newPatient: any) => {
    try {
      setLoading(true);
      // Create patient record
      const patientData = await apiClient.createPatient({
        user: newPatient.user_id,
        notes: newPatient.notes || ''
      });

      // Refresh patients list
      await loadPatients();
      setCurrentView("list");
    } catch (err: any) {
      setError(err.message || 'Failed to add patient');
      console.error('Error adding patient:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrakritiComplete = async (scores: any) => {
    if (!selectedPatient) return;

    try {
      setLoading(true);
      // Determine primary dosha
      const primaryDosha = Object.entries(scores).reduce((a, b) =>
        scores[a[0]] > scores[b[0]] ? a : b
      )[0];

      // Create Prakriti analysis
      await apiClient.createPrakritiAnalysis(selectedPatient.id, {
        primary_dosha: primaryDosha,
        vata_score: scores.vata,
        pitta_score: scores.pitta,
        kapha_score: scores.kapha,
        analysis_notes: `Prakriti analysis completed for ${selectedPatient.user_name}`
      });

      // Update patient status
      await apiClient.updatePatient(selectedPatient.id, {
        status: 'active'
      });

      // Refresh data
      await loadPatients();
      await loadPrakritiAnalyses(selectedPatient.id);

      setCurrentView("list");
    } catch (err: any) {
      setError(err.message || 'Failed to save Prakriti analysis');
      console.error('Error saving Prakriti analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDiseaseAnalysisComplete = async (analysisData: any) => {
    if (!selectedPatient) return;

    try {
      setLoading(true);
      // Create disease analysis
      await apiClient.createDiseaseAnalysis(selectedPatient.id, {
        disease_name: analysisData.disease_name || 'General Health Assessment',
        severity: analysisData.severity || 'mild',
        symptoms: analysisData.symptoms || 'Various symptoms reported',
        diagnosis_notes: analysisData.diagnosis_notes || '',
        treatment_plan: analysisData.treatment_plan || ''
      });

      // Refresh data
      await loadDiseaseAnalyses(selectedPatient.id);
      setCurrentView("list");
    } catch (err: any) {
      setError(err.message || 'Failed to save disease analysis');
      console.error('Error saving disease analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSummary = async (patient: Patient) => {
    setSelectedPatient(patient);
    await loadPatientSummary(patient.id);
    setCurrentView("summary");
  };

  const handlePrakritiAnalysis = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView("prakriti");
  };

  const handleDiseaseAnalysis = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView("disease");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'discharged': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderPatientCard = (patient: Patient) => (
    <Card key={patient.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-healing flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{patient.user_name}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <span>{patient.user_email}</span>
                <span>•</span>
                <span>ID: {patient.patient_id}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Registered: {formatDate(patient.registration_date)}</span>
                </div>
                {patient.last_consultation && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Last visit: {formatDate(patient.last_consultation)}</span>
                  </div>
                )}
              </div>

              {/* Prakriti Constitution */}
              {prakritiData && prakritiData.patient === patient.id && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Prakriti Constitution:</h4>
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="text-xs">
                      Vata: {prakritiData.dosha_percentages.vata}%
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Pitta: {prakritiData.dosha_percentages.pitta}%
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Kapha: {prakritiData.dosha_percentages.kapha}%
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            <Badge className={`${getStatusColor(patient.status)} mb-2`}>
              {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="flex space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePrakritiAnalysis(patient)}
            className="flex-1"
          >
            Prakriti Done
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDiseaseAnalysis(patient)}
            className="flex-1"
          >
            Disease Analysis
          </Button>
          <Button
            size="sm"
            onClick={() => handleViewSummary(patient)}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            View Summary
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (currentView === "add") {
    return (
      <div className="min-h-screen bg-gradient-earth">
        <div className="container mx-auto px-6 py-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView("list")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </Button>
          <AddPatientForm onSubmit={handleAddPatient} />
        </div>
      </div>
    );
  }

  if (currentView === "prakriti" && selectedPatient) {
    return (
      <div className="min-h-screen bg-gradient-earth">
        <div className="container mx-auto px-6 py-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView("list")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </Button>
          <PrakritiAnalysis
            patient={selectedPatient}
            onComplete={handlePrakritiComplete}
          />
        </div>
      </div>
    );
  }

  if (currentView === "disease" && selectedPatient) {
    return (
      <div className="min-h-screen bg-gradient-earth">
        <div className="container mx-auto px-6 py-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView("list")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </Button>
          <DiseaseAnalysis
            patient={selectedPatient}
            onComplete={handleDiseaseAnalysisComplete}
          />
        </div>
      </div>
    );
  }

  if (currentView === "summary" && selectedPatient && patientSummary) {
    return (
      <div className="min-h-screen bg-gradient-earth">
        <div className="container mx-auto px-6 py-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView("list")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </Button>
          <PatientSummary patient={patientSummary} />
        </div>
      </div>
    );
  }

  // Show loading while authentication is in progress
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-earth">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication required if not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-earth">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
              <p className="text-muted-foreground mb-4">Please log in to view patient profiles.</p>
              <Button onClick={() => navigate('/')}>
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => navigate('/doctor-dashboard')}
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Patient Profiles
              </h1>
              <p className="text-sm text-muted-foreground">Manage patient information and conduct assessments</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={() => setCurrentView("add")} disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Patient
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Error Alert */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Loading patients...</span>
          </div>
        )}

        {/* Patient List */}
        {!loading && (
          <div className="space-y-4">
            {filteredPatients.map(renderPatientCard)}

            {filteredPatients.length === 0 && !loading && (
              <Card className="text-center py-12">
                <CardContent>
                  <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No patients found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? "Try adjusting your search term" : "Get started by adding your first patient"}
                  </p>
                  <Button onClick={() => setCurrentView("add")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Patient
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientProfiles;