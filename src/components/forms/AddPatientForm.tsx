import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const AddPatientForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    location: "",
    height: "",
    weight: "",
    occupation: "",
    emergencyContact: "",
    medicalHistory: "",
    allergies: [],
    medications: "",
    lifestyle: {
      exercise: "",
      sleep: "",
      stress: "",
      smoking: false,
      alcohol: false
    }
  });

  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleLifestyleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      lifestyle: {
        ...prev.lifestyle,
        [field]: value
      }
    }));
  };

  const handleAllergyChange = (allergy, checked) => {
    setFormData(prev => ({
      ...prev,
      allergies: checked 
        ? [...prev.allergies, allergy]
        : prev.allergies.filter(a => a !== allergy)
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.age) newErrors.age = "Age is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const commonAllergies = [
    "Peanuts", "Dairy", "Gluten", "Shellfish", "Eggs", "Soy", "Tree nuts", "Fish"
  ];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Add New Patient</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
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
                />
                {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                  <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="patient@example.com"
                />
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="City, State"
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
              </div>
            </div>
          </div>

          {/* Physical Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Physical Details</h3>
            <div className="grid md:grid-cols-3 gap-4">
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
                  placeholder="65"
                />
              </div>
              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange("occupation", e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Medical Information</h3>
            <div>
              <Label htmlFor="medicalHistory">Medical History</Label>
              <Textarea
                id="medicalHistory"
                value={formData.medicalHistory}
                onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
                placeholder="Any previous medical conditions, surgeries, or significant health events..."
                className="min-h-20"
              />
            </div>

            <div>
              <Label>Known Allergies</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {commonAllergies.map((allergy) => (
                  <div key={allergy} className="flex items-center space-x-2">
                    <Checkbox
                      id={allergy}
                      checked={formData.allergies.includes(allergy)}
                      onCheckedChange={(checked) => handleAllergyChange(allergy, checked)}
                    />
                    <Label htmlFor={allergy} className="text-sm">{allergy}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="medications">Current Medications</Label>
              <Textarea
                id="medications"
                value={formData.medications}
                onChange={(e) => handleInputChange("medications", e.target.value)}
                placeholder="List any current medications or supplements..."
                className="min-h-16"
              />
            </div>
          </div>

          {/* Lifestyle Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Lifestyle Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Exercise Frequency</Label>
                <Select 
                  value={formData.lifestyle.exercise} 
                  onValueChange={(value) => handleLifestyleChange("exercise", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No exercise</SelectItem>
                    <SelectItem value="light">Light (1-2 times/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (3-4 times/week)</SelectItem>
                    <SelectItem value="heavy">Heavy (5+ times/week)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sleep Pattern</Label>
                <Select 
                  value={formData.lifestyle.sleep} 
                  onValueChange={(value) => handleLifestyleChange("sleep", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent (7-8 hours)</SelectItem>
                    <SelectItem value="good">Good (6-7 hours)</SelectItem>
                    <SelectItem value="poor">Poor (less than 6 hours)</SelectItem>
                    <SelectItem value="irregular">Irregular schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Stress Level</Label>
              <Select 
                value={formData.lifestyle.stress} 
                onValueChange={(value) => handleLifestyleChange("stress", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stress level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low stress</SelectItem>
                  <SelectItem value="moderate">Moderate stress</SelectItem>
                  <SelectItem value="high">High stress</SelectItem>
                  <SelectItem value="chronic">Chronic stress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="smoking"
                  checked={formData.lifestyle.smoking}
                  onCheckedChange={(checked) => handleLifestyleChange("smoking", checked)}
                />
                <Label htmlFor="smoking">Smoking</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="alcohol"
                  checked={formData.lifestyle.alcohol}
                  onCheckedChange={(checked) => handleLifestyleChange("alcohol", checked)}
                />
                <Label htmlFor="alcohol">Alcohol consumption</Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="emergencyContact">Emergency Contact</Label>
            <Input
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
              placeholder="Name and phone number"
            />
          </div>

          <div className="flex space-x-4">
            <Button type="button" variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Patient
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddPatientForm;