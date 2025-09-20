import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Users, Stethoscope, Leaf, Heart, ArrowRight, Star, Shield, Zap, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-ayurveda.jpg";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: Heart,
      title: "Holistic Health Analysis",
      description: "Comprehensive Prakriti and health assessments based on traditional Ayurvedic principles",
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      icon: Leaf,
      title: "Personalized Diet Plans",
      description: "AI-powered diet chart generation tailored to individual dosha constitution and health needs",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      icon: Users,
      title: "Practice Management",
      description: "Complete patient management system with food database and automated reminders",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
  ];

  const stats = [
    { label: "Active Patients", value: "500+", icon: Users },
    { label: "Diet Charts Generated", value: "2,500+", icon: Leaf },
    { label: "Food Items", value: "1,000+", icon: Heart },
    { label: "Satisfied Doctors", value: "50+", icon: Star },
  ];

  const testimonials = [
    {
      name: "Dr. Priya Sharma",
      role: "Ayurvedic Practitioner",
      content: "Aahaara360 has revolutionized my practice. The AI-powered diet chart generation saves me hours every day.",
      rating: 5,
    },
    {
      name: "Dr. Rahul Patel",
      role: "Nutrition Specialist",
      content: "The comprehensive patient management system helps me track patient progress effectively.",
      rating: 5,
    },
    {
      name: "Dr. Anita Singh",
      role: "General Practitioner",
      content: "The food database with dosha effects is incredibly detailed and accurate.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Aahaara360
            </h1>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="px-3 py-1">
                  Welcome, {user?.first_name}
                </Badge>
                <Button
                  onClick={() => navigate(user?.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard')}
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">About</Button>
                <Button variant="outline" size="sm">Contact</Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                <Star className="w-3 h-3 mr-1" />
                Trusted by 50+ Ayurvedic Practitioners
              </Badge>
              <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                  Comprehensive
                </span>
                <br />
                <span className="text-foreground">Ayurvedic Practice</span>
                <br />
                <span className="text-muted-foreground text-3xl lg:text-4xl">Management</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                Cloud-Based Practice Management & Nutrient Analysis Software for Ayurvedic Dietitians,
                Tailored for Ayurveda-Focused Diet Plans
              </p>
            </div>

            {/* Login Options */}
            {!isAuthenticated && (
              <div className="grid sm:grid-cols-2 gap-6">
                <Card className="group hover:shadow-warm transition-all duration-300 cursor-pointer border-primary/20 hover:border-primary/40"
                  onClick={() => navigate('/patient-login')}>
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-healing flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">Patient Login</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Access your personalized diet plans and track your wellness journey
                      </p>
                    </div>
                    <Button className="w-full bg-gradient-healing hover:opacity-90 border-0" size="lg">
                      Continue as Patient
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-warm transition-all duration-300 cursor-pointer border-primary/20 hover:border-primary/40"
                  onClick={() => navigate('/doctor-login')}>
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
                      <Stethoscope className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">Dietitian Login</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Manage patients, create diet plans, and analyze health data
                      </p>
                    </div>
                    <Button className="w-full bg-gradient-primary hover:opacity-90 border-0" size="lg">
                      Continue as Dietitian
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-sunset rounded-3xl blur-3xl opacity-20 transform rotate-6"></div>
            <img
              src={heroImage}
              alt="Ayurvedic ingredients and herbs"
              className="relative rounded-3xl shadow-healing w-full object-cover aspect-[4/3]"
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center p-6">
              <CardContent className="space-y-2">
                <stat.icon className="w-8 h-8 text-primary mx-auto" />
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Why Choose Aahaara360?</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform combines traditional Ayurvedic wisdom with modern technology to provide comprehensive healthcare solutions.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h4 className="text-xl font-semibold">{feature.title}</h4>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">What Our Users Say</h3>
            <p className="text-lg text-muted-foreground">
              Trusted by healthcare professionals across India
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        {!isAuthenticated && (
          <div className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl p-12">
            <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Practice?</h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of healthcare professionals who trust Aahaara360 for their practice management needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-primary hover:opacity-90"
                onClick={() => navigate('/doctor-login')}
              >
                <Stethoscope className="w-5 h-5 mr-2" />
                Start as Doctor
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/patient-login')}
              >
                <Users className="w-5 h-5 mr-2" />
                Join as Patient
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold">Aahaara360</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Comprehensive Ayurvedic Practice Management Platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Patient Management</li>
                <li>Diet Chart Generation</li>
                <li>Food Database</li>
                <li>Health Analytics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Documentation</li>
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Community</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Careers</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 Aahaara360. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;