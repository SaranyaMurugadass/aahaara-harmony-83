/**
 * API service for connecting with Django backend
 */

const API_BASE_URL = 'http://localhost:8000/api';

// API client configuration
class ApiClient {
    private baseURL: string;
    private token: string | null = null;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('auth_token');
    }

    setToken(token: string) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Token ${this.token}`;
        }

        console.log('🔍 API Request:', {
            url,
            method: options.method || 'GET',
            headers,
            body: options.body
        });

        const response = await fetch(url, {
            ...options,
            headers,
        });

        console.log('🔍 API Response:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ API Error Response:', errorData);
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('✅ API Success Response:', responseData);
        return responseData;
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
        return this.request('/auth/register/patient/', {
            method: 'POST',
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
        qualification: string;
        experience_years: number;
        license_number: string;
        specialization: string;
        bio?: string;
        consultation_fee?: number;
    }) {
        console.log('🔍 API Client - registerDoctor data:', data);
        console.log('🔍 API Client - JSON stringified:', JSON.stringify(data));

        return this.request('/auth/register/doctor/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async login(email: string, password: string) {
        const response = await this.request('/auth/login/', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (response.token) {
            this.setToken(response.token);
        }

        return response;
    }

    async logout() {
        const response = await this.request('/auth/logout/', {
            method: 'POST',
        });
        this.clearToken();
        return response;
    }

    async getUserProfile() {
        return this.request('/auth/profile/');
    }

    async updateProfile(data: any) {
        return this.request('/auth/profile/update/', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Patient endpoints
    async getPatients() {
        return this.request('/patients/');
    }

    async getPatient(id: number) {
        return this.request(`/patients/${id}/`);
    }

    async getPatientSummary(id: number) {
        return this.request(`/patients/${id}/summary/`);
    }

    async createPrakritiAnalysis(patientId: number, data: {
        primary_dosha: string;
        secondary_dosha?: string;
        vata_score: number;
        pitta_score: number;
        kapha_score: number;
        analysis_notes?: string;
    }) {
        return this.request(`/patients/${patientId}/prakriti/`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async createDiseaseAnalysis(patientId: number, data: {
        disease_name: string;
        severity: string;
        symptoms: string;
        diagnosis_notes?: string;
        treatment_plan?: string;
    }) {
        return this.request(`/patients/${patientId}/diseases/`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async createConsultation(patientId: number, data: {
        consultation_type: string;
        chief_complaint: string;
        history_of_present_illness?: string;
        physical_examination?: string;
        assessment?: string;
        plan?: string;
        prescription?: string;
        follow_up_date?: string;
        duration_minutes?: number;
    }) {
        return this.request(`/patients/${patientId}/consultations/`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Diet chart endpoints
    async getFoodDatabase() {
        return this.request('/diet-charts/food-database/');
    }

    async getFoodItems(params?: {
        search?: string;
        category?: string;
        dosha?: string;
        effect?: string;
    }) {
        const queryParams = new URLSearchParams(params).toString();
        const endpoint = queryParams ? `/diet-charts/foods/?${queryParams}` : '/diet-charts/foods/';
        return this.request(endpoint);
    }

    async getDietCharts() {
        return this.request('/diet-charts/charts/');
    }

    async getDietChart(id: number) {
        return this.request(`/diet-charts/charts/${id}/`);
    }

    async createDietChart(data: {
        patient: number;
        chart_name: string;
        chart_type: string;
        duration_days: number;
        start_date: string;
        end_date: string;
        description?: string;
    }) {
        return this.request('/diet-charts/charts/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async generateDietChart(data: {
        patient_id: number;
        chart_name: string;
        chart_type?: string;
        duration_days?: number;
    }) {
        return this.request('/diet-charts/generate/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getMealPlans(dietChartId: number) {
        return this.request(`/diet-charts/charts/${dietChartId}/meals/`);
    }

    async createMealPlan(dietChartId: number, data: {
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
    }) {
        return this.request(`/diet-charts/charts/${dietChartId}/meals/`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getDietRecommendations(doshaType?: string) {
        const endpoint = doshaType
            ? `/diet-charts/recommendations/?dosha_type=${doshaType}`
            : '/diet-charts/recommendations/';
        return this.request(endpoint);
    }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types for TypeScript
export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'patient' | 'doctor';
    doctor_profile?: DoctorProfile;
    patient_profile?: PatientProfile;
    date_joined: string;
    is_active: boolean;
}

export interface DoctorProfile {
    id: number;
    qualification: string;
    experience_years: number;
    license_number: string;
    specialization: string;
    bio: string;
    consultation_fee: number;
    is_verified: boolean;
}

export interface PatientProfile {
    id: number;
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
    id: number;
    user_name: string;
    user_email: string;
    assigned_doctor_name?: string;
    registration_date: string;
    last_consultation?: string;
    is_active: boolean;
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
