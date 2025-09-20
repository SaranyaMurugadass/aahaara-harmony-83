import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { apiClient } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface AddPatientFormProps {
  onSubmit: (patientData: any) => void;
}

const AddPatientForm = ({ onSubmit }: AddPatientFormProps) => {
  const [formData, setFormData] = useState({
    // User account fields
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    phone_number: "",

    // Patient profile fields
    age: "",
    gender: "",
    blood_type: "unknown",
    location: "",
    height: "",
    weight: "",
    medical_history: "",
    allergies: "",
    current_medications: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
    insurance_provider: "",
    insurance_number: ""
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate username from first and last name
    if (field === 'first_name' || field === 'last_name') {
      const firstName = field === 'first_name' ? value : formData.first_name;
      const lastName = field === 'last_name' ? value : formData.last_name;
      if (firstName && lastName) {
        const suggestedUsername = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
        setFormData(prev => ({
          ...prev,
          username: suggestedUsername
        }));
      }
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    // User account validation
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.password_confirm) newErrors.password_confirm = "Passwords do not match";
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!formData.phone_number.trim()) newErrors.phone_number = "Phone number is required";

    // Patient profile validation
    if (!formData.age) newErrors.age = "Age is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      // First, register the user as a patient
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        date_of_birth: new Date(new Date().getFullYear() - parseInt(formData.age), 0, 1).toISOString().split('T')[0],
        gender: formData.gender,
        blood_type: formData.blood_type,
        height: parseFloat(formData.height) || 0,
        weight: parseFloat(formData.weight) || 0,
        location: formData.location,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        emergency_contact_relation: formData.emergency_contact_relation,
        medical_history: formData.medical_history,
        allergies: formData.allergies,
        current_medications: formData.current_medications,
        insurance_provider: formData.insurance_provider,
        insurance_number: formData.insurance_number
      };

      const result = await apiClient.registerPatient(userData);

      toast({
        title: "Patient Added Successfully",
        description: `${formData.first_name} ${formData.last_name} has been registered as a patient.`,
      });

      // Call the parent component's onSubmit with the created user data
      onSubmit({
        user_id: result.user.id,
        notes: `Patient added via form. Medical history: ${formData.medical_history || 'None provided'}. Allergies: ${formData.allergies || 'None'}.`
      });

    } catch (error: any) {
      console.error('Error adding patient:', error);

      // Handle specific validation errors
      let errorMessage = "Failed to add patient. Please try again.";

      if (error.message && error.message.includes('email already exists')) {
        errorMessage = "A user with this email address already exists. Please use a different email.";
      } else if (error.message && error.message.includes('username already exists')) {
        errorMessage = "This username is already taken. Please choose a different username.";
      } else if (error.message && error.message.includes('phone number')) {
        errorMessage = "A user with this phone number already exists. Please use a different phone number.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error Adding Patient",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Add New Patient</CardTitle>
        <p className="text-sm text-muted-foreground">
          Please ensure the username and email are unique. If you get an error about existing credentials, try different values.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">User Account Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className={errors.username ? "border-red-500" : ""}
                  placeholder="Enter username"
                />
                {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                  placeholder="patient@example.com"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={errors.password ? "border-red-500" : ""}
                  placeholder="Enter password"
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
              <div>
                <Label htmlFor="password_confirm">Confirm Password *</Label>
                <Input
                  id="password_confirm"
                  type="password"
                  value={formData.password_confirm}
                  onChange={(e) => handleInputChange("password_confirm", e.target.value)}
                  className={errors.password_confirm ? "border-red-500" : ""}
                  placeholder="Confirm password"
                />
                {errors.password_confirm && <p className="text-sm text-red-500">{errors.password_confirm}</p>}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange("first_name", e.target.value)}
                  className={errors.first_name ? "border-red-500" : ""}
                  placeholder="Enter first name"
                />
                {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange("last_name", e.target.value)}
                  className={errors.last_name ? "border-red-500" : ""}
                  placeholder="Enter last name"
                />
                {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  className={errors.age ? "border-red-500" : ""}
                  placeholder="Enter age"
                />
                {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
              </div>
              <div>
                <Label>Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                  <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
              </div>
              <div>
                <Label>Blood Type</Label>
                <Select value={formData.blood_type} onValueChange={(value) => handleInputChange("blood_type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone_number">Phone Number *</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                  className={errors.phone_number ? "border-red-500" : ""}
                  placeholder="+91 98765 43210"
                />
                {errors.phone_number && <p className="text-sm text-red-500">{errors.phone_number}</p>}
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className={errors.location ? "border-red-500" : ""}
                  placeholder="City, State"
                />
                {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  placeholder="170"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  placeholder="70"
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Medical Information</h3>
            <div>
              <Label htmlFor="medical_history">Medical History</Label>
              <Textarea
                id="medical_history"
                value={formData.medical_history}
                onChange={(e) => handleInputChange("medical_history", e.target.value)}
                placeholder="Enter any relevant medical history..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="allergies">Allergies</Label>
              <Input
                id="allergies"
                value={formData.allergies}
                onChange={(e) => handleInputChange("allergies", e.target.value)}
                placeholder="List any allergies (comma separated)"
              />
            </div>

            <div>
              <Label htmlFor="current_medications">Current Medications</Label>
              <Input
                id="current_medications"
                value={formData.current_medications}
                onChange={(e) => handleInputChange("current_medications", e.target.value)}
                placeholder="List current medications"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Emergency Contact</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="emergency_contact_name">Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
                  placeholder="Emergency contact name"
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handleInputChange("emergency_contact_phone", e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact_relation">Relation</Label>
                <Input
                  id="emergency_contact_relation"
                  value={formData.emergency_contact_relation}
                  onChange={(e) => handleInputChange("emergency_contact_relation", e.target.value)}
                  placeholder="Father, Mother, Spouse, etc."
                />
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Insurance Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="insurance_provider">Insurance Provider</Label>
                <Input
                  id="insurance_provider"
                  value={formData.insurance_provider}
                  onChange={(e) => handleInputChange("insurance_provider", e.target.value)}
                  placeholder="Insurance company name"
                />
              </div>
              <div>
                <Label htmlFor="insurance_number">Insurance Number</Label>
                <Input
                  id="insurance_number"
                  value={formData.insurance_number}
                  onChange={(e) => handleInputChange("insurance_number", e.target.value)}
                  placeholder="Insurance policy number"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button type="button" variant="outline" className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Adding Patient..." : "Add Patient"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddPatientForm;