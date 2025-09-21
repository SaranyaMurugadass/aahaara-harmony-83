/**
 * Enhanced API service for connecting with Django backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// API client configuration
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem("auth_token");
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = 3
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Token ${this.token}`;
    }

    console.log("🔍 API Request:", {
      url,
      method: options.method || "GET",
      headers,
      body: options.body,
      token: this.token,
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log("🔍 API Response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        let errorData = {};
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json();
          } else {
            errorData = { error: await response.text() };
          }
        } catch (e) {
          errorData = { error: "Unknown error occurred" };
        }
        console.error("❌ API Error Response:", errorData);

        // Handle specific error cases
        if (response.status === 401) {
          // Unauthorized - clear token and redirect to login
          this.clearToken();
          window.location.href = "/patient-login";
          throw new Error("Session expired. Please login again.");
        }

        if (response.status === 403) {
          throw new Error(
            "Access denied. You don't have permission to perform this action."
          );
        }

        if (response.status >= 500) {
          throw new Error("Server error. Please try again later.");
        }

        // Handle validation errors with more detail
        if (response.status === 400 && errorData) {
          const validationErrors = [];
          for (const [field, messages] of Object.entries(errorData)) {
            if (Array.isArray(messages)) {
              validationErrors.push(`${field}: ${messages.join(", ")}`);
            } else {
              validationErrors.push(`${field}: ${messages}`);
            }
          }
          throw new Error(validationErrors.join("; "));
        }

        throw new Error(
          errorData.error ||
            errorData.detail ||
            `HTTP error! status: ${response.status}`
        );
      }

      let responseData;
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }
      } catch (e) {
        responseData = await response.text();
      }
      console.log("✅ API Success Response:", responseData);
      return responseData;
    } catch (error: any) {
      if (
        retries > 0 &&
        error.name === "TypeError" &&
        error.message.includes("fetch")
      ) {
        // Network error - retry
        console.log(`🔄 Retrying request (${retries} attempts left)...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.request<T>(endpoint, options, retries - 1);
      }
      throw error;
    }
  }

  // Authentication endpoints
  async registerPatient(data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    age: number;
    gender: string;
    location?: string;
    phone_number?: string;
  }) {
    return this.request("/auth/register/patient/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async registerDoctor(data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    qualification: string;
    experience_years: number;
    license_number: string;
    specialization: string;
    bio?: string;
    consultation_fee?: number;
    languages?: string[];
  }) {
    console.log("🔍 API Client - registerDoctor data:", data);
    console.log("🔍 API Client - JSON stringified:", JSON.stringify(data));

    return this.request("/auth/register/doctor/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string) {
    // Clear any existing token before login
    this.clearToken();

    console.log("🔐 Attempting login for:", email);

    // For login, don't use the request method that adds auth headers
    const response = await fetch(`${this.baseURL}/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    console.log("🔐 Login response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Login failed:", errorData);
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log(
      "✅ Login successful, received token:",
      data.token ? "Yes" : "No"
    );

    if (data.token) {
      this.setToken(data.token);
    }

    return data;
  }

  async logout() {
    console.log("🚪 Attempting logout...");
    const response = await this.request("/auth/logout/", {
      method: "POST",
    });
    this.clearToken();
    console.log("✅ Logout successful");
    return response;
  }

  async getUserProfile() {
    return this.request("/auth/profile/");
  }

  async updateProfile(data: any) {
    return this.request("/auth/profile/update/", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Patient endpoints
  async getPatients(): Promise<{
    results: Patient[];
    count: number;
    next: string | null;
    previous: string | null;
  }> {
    console.log("🔍 API Client - getPatients called");
    console.log("🔍 API Client - baseURL:", this.baseURL);
    console.log(
      "🔍 API Client - token:",
      this.token ? "Present" : "Not present"
    );

    const result = await this.request("/patients/");
    console.log("🔍 API Client - getPatients result:", result);
    return result;
  }

  async getPatient(id: string) {
    return this.request(`/patients/${id}/`);
  }

  async getPatientSummary(id: string): Promise<PatientSummaryType> {
    return this.request(`/patients/${id}/summary/`);
  }

  async createPatient(data: {
    user: {
      email: string;
      first_name: string;
      last_name: string;
    };
    gender?: string;
    location?: string;
    phone_number?: string;
    date_of_birth?: string;
    blood_type?: string;
    height?: number;
    weight?: number;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relation?: string;
    medical_history?: string;
    allergies?: string;
    current_medications?: string;
    insurance_provider?: string;
    insurance_number?: string;
  }) {
    return this.request("/patients/create/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePatient(
    id: string,
    data: {
      gender?: string;
      location?: string;
      phone_number?: string;
      height?: number;
      weight?: number;
      blood_type?: string;
    }
  ) {
    return this.request(`/patients/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePatient(id: string) {
    return this.request(`/patients/${id}/`, {
      method: "DELETE",
    });
  }

  async assignDoctor(patientId: string) {
    return this.request(`/patients/${patientId}/assign-doctor/`, {
      method: "POST",
    });
  }

  async getPrakritiAnalyses(
    patientId: string
  ): Promise<PrakritiAnalysisType[]> {
    return this.request(`/patients/${patientId}/prakriti/`);
  }

  async getDiseaseAnalyses(patientId: string): Promise<DiseaseAnalysisType[]> {
    return this.request(`/patients/${patientId}/diseases/`);
  }

  async getConsultations(patientId: string) {
    return this.request(`/patients/${patientId}/consultations/`);
  }

  async createPrakritiAnalysis(
    patientId: string,
    data: {
      primary_dosha: string;
      secondary_dosha?: string;
      vata_score: number;
      pitta_score: number;
      kapha_score: number;
      analysis_notes?: string;
      status?: string;
    }
  ) {
    return this.request(`/patients/${patientId}/prakriti/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createDiseaseAnalysis(
    patientId: string,
    data: {
      disease_name: string;
      severity: string;
      symptoms: string;
      diagnosis_notes?: string;
      treatment_plan?: string;
    }
  ) {
    return this.request(`/patients/${patientId}/diseases/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createConsultation(
    patientId: string,
    data: {
      consultation_type: string;
      chief_complaint: string;
      history_of_present_illness?: string;
      physical_examination?: string;
      assessment?: string;
      plan?: string;
      prescription?: string;
      follow_up_date?: string;
      duration_minutes?: number;
    }
  ) {
    return this.request(`/patients/${patientId}/consultations/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Diet chart endpoints
  async getFoodDatabase() {
    return this.request("/diet-charts/food-database/");
  }

  async getDietCharts() {
    return this.request("/diet-charts/");
  }

  async getDietChart(id: string) {
    return this.request(`/diet-charts/${id}/`);
  }

  async createDietChart(data: {
    patient: string;
    chart_name: string;
    chart_type: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    total_days?: number;
    daily_meals?: any;
    target_calories?: number;
    meal_distribution?: any;
    notes?: string;
  }) {
    return this.request("/diet-charts/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async generateDietChart(data: {
    patient_id: string;
    chart_name: string;
    chart_type?: string;
    duration_days?: number;
  }) {
    return this.request("/diet-charts/generate/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async saveDietChart(data: {
    patient_id: string;
    patient_name: string;
    prakriti?: string;
    total_calories: number;
    chart_data: any;
    created_by: string;
    status: string;
    created_at: string;
  }) {
    return this.request("/diet-charts/save/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getPatientDietCharts(patientId: string) {
    return this.request(`/diet-charts/patient/${patientId}/`);
  }

  async getPatientLatestDietChart(patientId: string) {
    return this.request(`/diet-charts/patient/${patientId}/latest/`);
  }

  async getMealPlans(dietChartId: string) {
    return this.request(`/diet-charts/charts/${dietChartId}/meals/`);
  }

  async createMealPlan(
    dietChartId: string,
    data: {
      meal_type: string;
      meal_name: string;
      description?: string;
      timing: string;
      preparation_notes?: string;
      day_of_week: number;
      meal_items?: Array<{
        food_item: number;
        quantity: string;
        unit?: string;
        notes?: string;
      }>;
    }
  ) {
    return this.request(`/diet-charts/charts/${dietChartId}/meals/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getDietRecommendations(doshaType?: string) {
    const endpoint = doshaType
      ? `/diet-charts/recommendations/?dosha_type=${doshaType}`
      : "/diet-charts/recommendations/";
    return this.request(endpoint);
  }

  // Food Database Methods
  async getFoodItems(params?: {
    search?: string;
    vata_effect?: string;
    pitta_effect?: string;
    kapha_effect?: string;
    meal_types?: string[];
    food_category?: string;
    tags?: string[];
    rasa?: string[];
    guna?: string[];
    virya?: string;
    min_calories?: number;
    max_calories?: number;
    min_protein?: number;
    max_protein?: number;
    page?: number;
    page_size?: number;
  }) {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            searchParams.append(key, JSON.stringify(value));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }

    const endpoint = `/foods/?${searchParams.toString()}`;
    return this.request(endpoint);
  }

  async getFoodItem(foodId: string) {
    return this.request(`/foods/${foodId}/`);
  }

  async createFoodItem(data: {
    name: string;
    serving_size: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    rasa: string[];
    guna: string[];
    virya: string;
    vata_effect: string;
    pitta_effect: string;
    kapha_effect: string;
    meal_types: string[];
    food_category: string;
    tags: string[];
  }) {
    return this.request("/foods/create/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateFoodItem(
    foodId: string,
    data: Partial<{
      name: string;
      serving_size: string;
      calories: number;
      protein_g: number;
      carbs_g: number;
      fat_g: number;
      fiber_g: number;
      rasa: string[];
      guna: string[];
      virya: string;
      vata_effect: string;
      pitta_effect: string;
      kapha_effect: string;
      meal_types: string[];
      food_category: string;
      tags: string[];
    }>
  ) {
    return this.request(`/foods/${foodId}/update/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteFoodItem(foodId: string) {
    return this.request(`/foods/${foodId}/delete/`, {
      method: "DELETE",
    });
  }

  async importCSVFoods(csvFile: File) {
    const formData = new FormData();
    formData.append("csv_file", csvFile);

    return this.request("/foods/import-csv/", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async getFoodCategories() {
    return this.request("/foods/categories/");
  }

  async getFoodStats() {
    return this.request("/foods/stats/");
  }

  // Patient Reports API
  async uploadPatientReport(
    file: File,
    patientId: string,
    reportType: string,
    title?: string,
    description?: string,
    notes?: string,
    reportDate?: string,
    isUrgent?: boolean
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("patient_id", patientId);
    formData.append("report_type", reportType);
    if (title) formData.append("title", title);
    if (description) formData.append("description", description);
    if (notes) formData.append("notes", notes);
    if (reportDate) formData.append("report_date", reportDate);
    if (isUrgent !== undefined)
      formData.append("is_urgent", isUrgent.toString());

    return this.request("/patients/reports/upload/", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async getPatientReports(patientId: string) {
    return this.request(`/patients/reports/patient/${patientId}/`);
  }

  async getAllReports() {
    return this.request("/patients/reports/");
  }

  async getReport(reportId: string) {
    return this.request(`/patients/reports/${reportId}/`);
  }

  async updateReport(reportId: string, data: any) {
    return this.request(`/patients/reports/${reportId}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteReport(reportId: string) {
    return this.request(`/patients/reports/${reportId}/`, {
      method: "DELETE",
    });
  }

  async downloadReport(reportId: string) {
    const response = await fetch(
      `${this.baseURL}/patients/reports/${reportId}/download/`,
      {
        method: "GET",
        headers: {
          Authorization: `Token ${this.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return response.blob();
  }

  async getReportStats() {
    return this.request("/patients/reports/stats/");
  }

  async getReportComments(reportId: string) {
    return this.request(`/patients/reports/${reportId}/comments/`);
  }

  async addReportComment(
    reportId: string,
    comment: string,
    isInternal: boolean = true
  ) {
    return this.request(`/patients/reports/${reportId}/comments/`, {
      method: "POST",
      body: JSON.stringify({
        report: reportId,
        comment,
        is_internal: isInternal,
      }),
    });
  }

  async shareReport(
    reportId: string,
    recipientEmail: string,
    recipientName?: string,
    message?: string,
    expiresAt?: string
  ) {
    return this.request(`/patients/reports/${reportId}/shares/`, {
      method: "POST",
      body: JSON.stringify({
        report: reportId,
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        message,
        expires_at: expiresAt,
      }),
    });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types for TypeScript
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "patient" | "doctor";
  doctor_profile?: DoctorProfile;
  patient_profile?: PatientProfile;
  date_joined: string;
  is_active: boolean;
}

export interface DoctorProfile {
  id: string;
  qualification: string;
  experience_years: number;
  license_number: string;
  specialization: string;
  bio: string;
  consultation_fee: number;
  is_verified: boolean;
}

export interface PatientProfile {
  id: string;
  age: number;
  gender: string;
  location: string;
  phone_number: string;
  emergency_contact: string;
  medical_history: string;
  allergies: string;
  current_medications: string;
}

export interface Patient {
  id: string;
  patient_id: string;
  user_name: string;
  user_email: string;
  assigned_doctor_name?: string;
  status: "active" | "inactive" | "suspended" | "discharged";
  registration_date: string;
  last_consultation?: string;
  next_appointment?: string;
  is_active: boolean;
  notes?: string;
  display_name: string;
}

export interface PrakritiAnalysis {
  id: string;
  patient: string;
  patient_name: string;
  primary_dosha: string;
  primary_dosha_display: string;
  secondary_dosha?: string;
  vata_score: number;
  pitta_score: number;
  kapha_score: number;
  total_score: number;
  dosha_percentages: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  analysis_notes?: string;
  recommendations?: string;
  status: "draft" | "completed" | "reviewed";
  analyzed_by: string;
  analyzed_by_name: string;
  analysis_date: string;
  updated_at: string;
}

export interface DiseaseAnalysis {
  id: string;
  patient: string;
  patient_name: string;
  disease_name: string;
  icd_code?: string;
  severity: "mild" | "moderate" | "severe" | "critical";
  severity_display: string;
  status: "active" | "inactive" | "cured" | "chronic";
  status_display: string;
  symptoms: string;
  diagnosis_notes?: string;
  treatment_plan?: string;
  medications: any[];
  follow_up_required: boolean;
  follow_up_date?: string;
  diagnosed_by: string;
  diagnosed_by_name: string;
  diagnosis_date: string;
  updated_at: string;
  is_active: boolean;
}

export interface Consultation {
  id: number;
  patient: number;
  patient_name: string;
  doctor: number;
  doctor_name: string;
  consultation_type:
    | "initial"
    | "follow_up"
    | "emergency"
    | "routine"
    | "telemedicine"
    | "diet_review";
  consultation_type_display: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
  status_display: string;
  chief_complaint: string;
  history_of_present_illness?: string;
  physical_examination?: string;
  vital_signs: Record<string, any>;
  assessment?: string;
  plan?: string;
  prescription?: string;
  recommendations?: string;
  follow_up_date?: string;
  consultation_date: string;
  actual_start_time?: string;
  actual_end_time?: string;
  duration_minutes: number;
  actual_duration?: number;
  consultation_fee?: number;
  payment_status: "pending" | "paid" | "partial" | "waived";
  notes?: string;
}

export interface PatientSummary {
  patient: Patient;
  prakriti_analysis?: PrakritiAnalysis;
  active_diseases: DiseaseAnalysis[];
  recent_consultations: Consultation[];
}

export interface FoodItem {
  id: number;
  name: string;
  category: string;
  description: string;
  nutritional_info: Record<string, any>;
  vata_effect: string;
  pitta_effect: string;
  kapha_effect: string;
  is_ayurvedic: boolean;
  image_url?: string;
}

export interface DietChart {
  id: number;
  patient_name: string;
  chart_name: string;
  chart_type: string;
  description: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_by_name: string;
  meal_plans: MealPlan[];
}

export interface MealPlan {
  id: number;
  meal_type: string;
  meal_name: string;
  description: string;
  timing: string;
  preparation_notes: string;
  day_of_week: number;
  meal_items: MealItem[];
}

export interface MealItem {
  id: number;
  food_item_name: string;
  food_item_category: string;
  quantity: string;
  unit: string;
  notes: string;
}

// Patient Report Types
export interface PatientReport {
  id: string;
  patient: string;
  patient_name: string;
  uploaded_by: string;
  uploaded_by_name: string;
  report_type: string;
  title: string;
  description?: string;
  notes?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_size_mb: number;
  file_type: string;
  public_url?: string;
  report_date?: string;
  status: "pending" | "reviewed" | "archived";
  is_urgent: boolean;
  is_recent: boolean;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReportComment {
  id: string;
  report: string;
  author: string;
  author_name: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportShare {
  id: string;
  report: string;
  shared_by: string;
  shared_by_name: string;
  recipient_email: string;
  recipient_name?: string;
  message?: string;
  access_token: string;
  expires_at: string;
  is_accessed: boolean;
  accessed_at?: string;
  is_expired: boolean;
  created_at: string;
}

export interface ReportStats {
  total_reports: number;
  pending_reports: number;
  urgent_reports: number;
  recent_reports: number;
  reports_by_type: Record<string, number>;
}
