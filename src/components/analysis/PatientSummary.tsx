import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Heart,
  Activity,
  Download,
  FileText,
  Calendar,
  Phone,
  MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { PatientSummary as PatientSummaryType } from "@/services/api";
import html2pdf from "html2pdf.js";

interface PatientSummaryProps {
  patient: PatientSummaryType;
}

const PatientSummary = ({ patient }: PatientSummaryProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleExportSummary = async () => {
    if (!contentRef.current) return;

    toast({
      title: "Exporting Summary",
      description: "Patient summary is being exported as PDF...",
    });

    try {
      // Temporarily hide buttons for PDF generation
      const buttons = contentRef.current.querySelectorAll(".no-print");
      const originalStyles: string[] = [];

      buttons.forEach((button) => {
        const element = button as HTMLElement;
        originalStyles.push(element.style.display);
        element.style.display = "none";
      });

      const opt = {
        margin: 1,
        filename: `${patient.patient.user_name.replace(
          /\s+/g,
          "_"
        )}_summary.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(contentRef.current).save();

      // Restore button visibility
      buttons.forEach((button, index) => {
        const element = button as HTMLElement;
        element.style.display = originalStyles[index];
      });

      toast({
        title: "PDF Exported Successfully!",
        description: "Patient summary has been downloaded as PDF.",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Check if both analyses are completed (for status display only)
  const isPrakritiCompleted = !!patient.prakriti_analysis;
  const isDiseaseAnalysisCompleted =
    patient.active_diseases && patient.active_diseases.length > 0;

  const handleSaveResults = () => {
    toast({
      title: "Results Saved",
      description: "Patient analysis has been saved successfully.",
    });
    navigate("/patient-profiles");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-yellow-100 text-yellow-800";
      case "discharged":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "severe":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div ref={contentRef} className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Summary</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive health analysis and recommendations
          </p>
        </div>
        <div className="flex space-x-3 no-print">
          <Button variant="outline" onClick={handleExportSummary}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button
            onClick={handleSaveResults}
            className="bg-green-600 hover:bg-green-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Save Results
          </Button>
        </div>
      </div>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-lg">
                {patient.patient.user_name}
              </h3>
              <p className="text-gray-600">{patient.patient.user_email}</p>
              <p className="text-sm text-gray-500">
                ID: {patient.patient.patient_id}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span>
                  Registered: {formatDate(patient.patient.registration_date)}
                </span>
              </div>
              {patient.patient.last_consultation && (
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    Last Visit: {formatDate(patient.patient.last_consultation)}
                  </span>
                </div>
              )}
              {patient.patient.next_appointment && (
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    Next Appointment:{" "}
                    {formatDate(patient.patient.next_appointment)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center">
              <Badge className={`${getStatusColor(patient.patient.status)}`}>
                {patient.patient.status.charAt(0).toUpperCase() +
                  patient.patient.status.slice(1)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Analysis Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 rounded-lg border">
              <div
                className={`w-4 h-4 rounded-full ${
                  isPrakritiCompleted ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
              <div>
                <h4 className="font-medium">Prakriti Analysis</h4>
                <p className="text-sm text-gray-600">
                  {isPrakritiCompleted ? "Completed" : "Pending"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg border">
              <div
                className={`w-4 h-4 rounded-full ${
                  isDiseaseAnalysisCompleted ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
              <div>
                <h4 className="font-medium">Disease Analysis</h4>
                <p className="text-sm text-gray-600">
                  {isDiseaseAnalysisCompleted ? "Completed" : "Pending"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prakriti Analysis */}
      {patient.prakriti_analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Prakriti Constitution Analysis
            </CardTitle>
            <CardDescription>
              Analyzed on {formatDate(patient.prakriti_analysis.analysis_date)}{" "}
              by {patient.prakriti_analysis.analyzed_by_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-healing flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-white capitalize">
                    {patient.prakriti_analysis.primary_dosha.charAt(0)}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Primary Constitution:{" "}
                  {patient.prakriti_analysis.primary_dosha_display}
                </h3>
                {patient.prakriti_analysis.secondary_dosha && (
                  <p className="text-gray-600">
                    Secondary: {patient.prakriti_analysis.secondary_dosha}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {Object.entries(
                  patient.prakriti_analysis.dosha_percentages
                ).map(([dosha, percentage]) => (
                  <div key={dosha} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="capitalize font-medium">{dosha}</span>
                      <span className="text-sm font-medium">{percentage}%</span>
                    </div>
                    <Progress value={percentage as number} className="h-3" />
                  </div>
                ))}
              </div>

              {patient.prakriti_analysis.analysis_notes && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Analysis Notes:</h4>
                  <p className="text-sm text-gray-600">
                    {patient.prakriti_analysis.analysis_notes}
                  </p>
                </div>
              )}

              {patient.prakriti_analysis.recommendations && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Recommendations:</h4>
                  <p className="text-sm text-gray-600">
                    {patient.prakriti_analysis.recommendations}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disease Analysis */}
      {patient.active_diseases && patient.active_diseases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Active Health Conditions
            </CardTitle>
            <CardDescription>
              Current health conditions and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patient.active_diseases.map((disease, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {disease.disease_name}
                      </h4>
                      {disease.icd_code && (
                        <p className="text-sm text-gray-500">
                          ICD: {disease.icd_code}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Badge
                        className={`${getSeverityColor(disease.severity)}`}
                      >
                        {disease.severity_display}
                      </Badge>
                      <Badge variant="outline">{disease.status_display}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <h5 className="font-medium text-sm text-gray-700">
                        Symptoms:
                      </h5>
                      <p className="text-sm text-gray-600">
                        {disease.symptoms}
                      </p>
                    </div>

                    {disease.diagnosis_notes && (
                      <div>
                        <h5 className="font-medium text-sm text-gray-700">
                          Diagnosis Notes:
                        </h5>
                        <p className="text-sm text-gray-600">
                          {disease.diagnosis_notes}
                        </p>
                      </div>
                    )}

                    {disease.treatment_plan && (
                      <div>
                        <h5 className="font-medium text-sm text-gray-700">
                          Treatment Plan:
                        </h5>
                        <p className="text-sm text-gray-600">
                          {disease.treatment_plan}
                        </p>
                      </div>
                    )}

                    {disease.follow_up_required && disease.follow_up_date && (
                      <div className="flex items-center text-sm text-blue-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          Follow-up required:{" "}
                          {formatDate(disease.follow_up_date)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Consultations */}
      {patient.recent_consultations &&
        patient.recent_consultations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Recent Consultations
              </CardTitle>
              <CardDescription>
                Latest consultation records and notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.recent_consultations.map((consultation, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">
                          {consultation.consultation_type_display}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {formatDate(consultation.consultation_date)} with{" "}
                          {consultation.doctor_name}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {consultation.status_display}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <h5 className="font-medium text-sm text-gray-700">
                          Chief Complaint:
                        </h5>
                        <p className="text-sm text-gray-600">
                          {consultation.chief_complaint}
                        </p>
                      </div>

                      {consultation.assessment && (
                        <div>
                          <h5 className="font-medium text-sm text-gray-700">
                            Assessment:
                          </h5>
                          <p className="text-sm text-gray-600">
                            {consultation.assessment}
                          </p>
                        </div>
                      )}

                      {consultation.plan && (
                        <div>
                          <h5 className="font-medium text-sm text-gray-700">
                            Treatment Plan:
                          </h5>
                          <p className="text-sm text-gray-600">
                            {consultation.plan}
                          </p>
                        </div>
                      )}

                      {consultation.prescription && (
                        <div>
                          <h5 className="font-medium text-sm text-gray-700">
                            Prescription:
                          </h5>
                          <p className="text-sm text-gray-600">
                            {consultation.prescription}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Notes Section */}
      {patient.patient.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{patient.patient.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientSummary;
