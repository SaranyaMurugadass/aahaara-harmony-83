import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Lock, User, GraduationCap, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/services/api";

const DoctorAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Registration
        const formData = new FormData(e.target as HTMLFormElement);
        const data = {
          username: formData.get('username') as string,
          email: formData.get('email') as string,
          password: formData.get('password') as string,
          password_confirm: formData.get('password') as string,
          first_name: formData.get('firstName') as string,
          last_name: formData.get('lastName') as string,
          qualification: formData.get('qualification') as string,
          experience_years: parseInt(formData.get('experience') as string) || 0,
          license_number: formData.get('license') as string,
          specialization: formData.get('specialization') as string,
          bio: formData.get('bio') as string || '',
          consultation_fee: parseFloat(formData.get('consultation_fee') as string) || 0.00,
        };

        // Debug: Log the data being sent
        console.log('🔍 Doctor Registration Data:', data);
        console.log('🔍 Form Data Values:', {
          username: formData.get('username'),
          email: formData.get('email'),
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          qualification: formData.get('qualification'),
          experience: formData.get('experience'),
          license: formData.get('license'),
          specialization: formData.get('specialization'),
          bio: formData.get('bio'),
          consultation_fee: formData.get('consultation_fee'),
        });

        // Validate password length
        if (data.password.length < 8) {
          toast({
            title: "Password too short",
            description: "Password must be at least 8 characters long",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        console.log('🚀 Sending request to API...');
        const response = await apiClient.registerDoctor(data);
        console.log('✅ API Response:', response);

        toast({
          title: "Account created successfully!",
          description: "Your dietitian account has been created. You can now access your practice dashboard.",
        });
      } else {
        // Login
        const formData = new FormData(e.target as HTMLFormElement);
        const data = {
          email: formData.get('email') as string,
          password: formData.get('password') as string,
        };

        await apiClient.login(data.email, data.password);

        toast({
          title: "Welcome back, Doctor!",
          description: "Redirecting to your dashboard...",
        });
      }

      // Navigate to doctor dashboard
      setTimeout(() => {
        navigate('/doctor-dashboard');
      }, 1500);
    } catch (error) {
      console.error('❌ Doctor Registration Error:', error);
      console.error('❌ Error Details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-earth flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="shadow-warm">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              Dietitian Portal
            </CardTitle>
            <p className="text-muted-foreground">
              Professional practice management for Ayurvedic dietitians
            </p>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="signin" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary hover:opacity-90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="Choose a username"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="First name"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualification">Qualification</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="qualification"
                        name="qualification"
                        placeholder="e.g., BAMS, M.D. Ayurveda"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      name="experience"
                      type="number"
                      placeholder="Years of practice"
                      min="0"
                      max="50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license">License Number</Label>
                    <div className="relative">
                      <Award className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="license"
                        name="license"
                        placeholder="Professional license number"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <select
                      id="specialization"
                      name="specialization"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      required
                    >
                      <option value="">Select specialization</option>
                      <option value="general">General Ayurveda</option>
                      <option value="nutrition">Ayurvedic Nutrition</option>
                      <option value="panchakarma">Panchakarma</option>
                      <option value="lifestyle">Lifestyle Medicine</option>
                      <option value="chronic-diseases">Chronic Diseases</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell us about your practice..."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="consultation_fee">Consultation Fee (₹)</Label>
                    <Input
                      id="consultation_fee"
                      name="consultation_fee"
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Create password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary hover:opacity-90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
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