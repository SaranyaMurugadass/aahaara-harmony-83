import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Eye, EyeOff, Loader2, CheckCircle, Stethoscope } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/services/api";

const DoctorAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Registration form state
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    qualification: "",
    experience_years: "",
    license_number: "",
    specialization: "",
    bio: "",
    consultation_fee: "",
    languages: [] as string[],
  });

  const from = location.state?.from?.pathname || "/doctor-dashboard";

  const specializations = [
    { label: "General Ayurveda", value: "general" },
    { label: "Ayurvedic Nutrition", value: "nutrition" },
    { label: "Panchakarma", value: "panchakarma" },
    { label: "Lifestyle Medicine", value: "lifestyle" },
    { label: "Chronic Diseases", value: "chronic-diseases" },
    { label: "Pediatric Ayurveda", value: "pediatric" },
    { label: "Geriatric Ayurveda", value: "geriatric" },
    { label: "Women's Health", value: "women-health" },
    { label: "Mental Health", value: "mental-health" },
  ];

  const languages = [
    "Hindi", "English", "Sanskrit", "Tamil", "Telugu", "Kannada",
    "Malayalam", "Bengali", "Gujarati", "Marathi", "Punjabi"
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(loginData.email, loginData.password);
      if (success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiClient.registerDoctor(registerData);
      if (response.token && response.user) {
        toast({
          title: "Registration Successful!",
          description: "Your doctor account has been created successfully. You are now logged in.",
        });
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegisterInputChange = (field: string, value: string) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
  };

  const handleLanguageChange = (language: string, checked: boolean) => {
    setRegisterData(prev => ({
      ...prev,
      languages: checked
        ? [...prev.languages, language]
        : prev.languages.filter(l => l !== language)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Doctor Portal
            </CardTitle>
            <CardDescription>
              Join our network of Ayurvedic healthcare professionals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Login
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        placeholder="First name"
                        value={registerData.first_name}
                        onChange={(e) => handleRegisterInputChange("first_name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        placeholder="Last name"
                        value={registerData.last_name}
                        onChange={(e) => handleRegisterInputChange("last_name", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerData.email}
                      onChange={(e) => handleRegisterInputChange("email", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Choose a username"
                      value={registerData.username}
                      onChange={(e) => handleRegisterInputChange("username", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      placeholder="Enter your phone number"
                      value={registerData.phone_number}
                      onChange={(e) => handleRegisterInputChange("phone_number", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualification">Qualification</Label>
                    <Input
                      id="qualification"
                      placeholder="e.g., BAMS, MD (Ayurveda)"
                      value={registerData.qualification}
                      onChange={(e) => handleRegisterInputChange("qualification", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience_years">Years of Experience</Label>
                      <Input
                        id="experience_years"
                        type="number"
                        placeholder="Years"
                        value={registerData.experience_years}
                        onChange={(e) => handleRegisterInputChange("experience_years", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="consultation_fee">Consultation Fee (₹)</Label>
                      <Input
                        id="consultation_fee"
                        type="number"
                        placeholder="Fee per consultation"
                        value={registerData.consultation_fee}
                        onChange={(e) => handleRegisterInputChange("consultation_fee", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license_number">License Number</Label>
                    <Input
                      id="license_number"
                      placeholder="Medical license number"
                      value={registerData.license_number}
                      onChange={(e) => handleRegisterInputChange("license_number", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <select
                      id="specialization"
                      value={registerData.specialization}
                      onChange={(e) => handleRegisterInputChange("specialization", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Select Specialization</option>
                      {specializations.map((spec) => (
                        <option key={spec.value} value={spec.value}>
                          {spec.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Languages Spoken</Label>
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                      {languages.map((language) => (
                        <label key={language} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={registerData.languages.includes(language)}
                            onChange={(e) => handleLanguageChange(language, e.target.checked)}
                            className="rounded border-input"
                          />
                          <span>{language}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      placeholder="Tell us about your experience and approach..."
                      value={registerData.bio}
                      onChange={(e) => handleRegisterInputChange("bio", e.target.value)}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={registerData.password}
                        onChange={(e) => handleRegisterInputChange("password", e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirm">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="password_confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={registerData.password_confirm}
                        onChange={(e) => handleRegisterInputChange("password_confirm", e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {registerData.password !== registerData.password_confirm && registerData.password_confirm && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        Passwords do not match
                      </AlertDescription>
                    </Alert>
                  )}

                  <Alert>
                    <AlertDescription>
                      By registering, you agree to our terms of service and privacy policy.
                      Your account will be verified before you can start using the platform.
                    </AlertDescription>
                  </Alert>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Create Doctor Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorAuth;