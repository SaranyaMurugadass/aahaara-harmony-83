import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, User, Calendar, Phone, MapPin, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PrakritiAnalysis from "@/components/analysis/PrakritiAnalysis";
import DiseaseAnalysis from "@/components/analysis/DiseaseAnalysis";
import PatientSummary from "@/components/analysis/PatientSummary";
import AddPatientForm from "@/components/forms/AddPatientForm";
import { useNavigate } from "react-router-dom";

// Mock patient data
const mockPatients = [
  {
    id: 1,
    name: "Priya Sharma",
    age: 32,
    gender: "Female",
    phone: "+91 98765 43210",
    location: "Mumbai, Maharashtra",
    prakritiScore: { vata: 30, pitta: 50, kapha: 20 },
    lastVisit: "2024-01-15",
    status: "Active"
  },
  {
    id: 2,
    name: "Rahul Patel",
    age: 28,
    gender: "Male",
    phone: "+91 87654 32109",
    location: "Ahmedabad, Gujarat",
    prakritiScore: { vata: 45, pitta: 30, kapha: 25 },
    lastVisit: "2024-01-12",
    status: "Completed"
  },
  {
    id: 3,
    name: "Anita Singh",
    age: 41,
    gender: "Female",
    phone: "+91 76543 21098",
    location: "Delhi, India",
    prakritiScore: null,
    lastVisit: "2024-01-10",
    status: "Pending"
  }
];

const PatientProfiles = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentView, setCurrentView] = useState("list"); // list, add, prakriti, disease, summary
  const [patients, setPatients] = useState(mockPatients);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPatient = (newPatient) => {
    const patient = {
      ...newPatient,
      id: patients.length + 1,
      prakritiScore: null,
      lastVisit: new Date().toISOString().split('T')[0],
      status: "Pending"
    };
    setPatients([...patients, patient]);
    setCurrentView("list");
  };

  const handlePrakritiComplete = (scores) => {
    setPatients(patients.map(p => 
      p.id === selectedPatient.id 
        ? { ...p, prakritiScore: scores, status: "Active" }
        : p
    ));
    setSelectedPatient({ ...selectedPatient, prakritiScore: scores });
  };

  const renderPatientCard = (patient) => (
    <Card key={patient.id} className="hover:shadow-warm transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-healing flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{patient.name}</h3>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                <span>{patient.age} years • {patient.gender}</span>
                <div className="flex items-center">
                  <Phone className="w-3 h-3 mr-1" />
                  {patient.phone}
                </div>
              </div>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                {patient.location}
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge 
              variant={patient.status === "Active" ? "default" : 
                      patient.status === "Completed" ? "secondary" : "outline"}
            >
              {patient.status}
            </Badge>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <Calendar className="w-3 h-3 mr-1" />
              Last visit: {patient.lastVisit}
            </div>
          </div>
        </div>
        
        {patient.prakritiScore && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm font-medium mb-2">Prakriti Constitution:</p>
            <div className="flex space-x-2">
              <Badge variant="outline">Vata: {patient.prakritiScore.vata}%</Badge>
              <Badge variant="outline">Pitta: {patient.prakritiScore.pitta}%</Badge>
              <Badge variant="outline">Kapha: {patient.prakritiScore.kapha}%</Badge>
            </div>
          </div>
        )}
        
        <div className="mt-4 flex space-x-2">
          <Button 
            size="sm" 
            onClick={() => {
              setSelectedPatient(patient);
              setCurrentView("prakriti");
            }}
            disabled={patient.prakritiScore !== null}
          >
            {patient.prakritiScore ? "Prakriti Done" : "Prakriti Analysis"}
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              setSelectedPatient(patient);
              setCurrentView("disease");
            }}
          >
            Disease Analysis
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => {
              setSelectedPatient(patient);
              setCurrentView("summary");
            }}
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
          <DiseaseAnalysis patient={selectedPatient} />
        </div>
      </div>
    );
  }

  if (currentView === "summary" && selectedPatient) {
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
          <PatientSummary patient={selectedPatient} />
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
            <Button onClick={() => setCurrentView("add")}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Patient
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Patient List */}
        <div className="space-y-4">
          {filteredPatients.map(renderPatientCard)}
          
          {filteredPatients.length === 0 && (
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
      </main>
    </div>
  );
};

export default PatientProfiles;