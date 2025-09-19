import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Users, Stethoscope, Leaf, Heart } from "lucide-react";
import heroImage from "@/assets/hero-ayurveda.jpg";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Leaf className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Aahaara360
            </h1>
          </div>
          <div className="hidden md:flex space-x-2">
            <Button variant="outline" size="sm">About</Button>
            <Button variant="outline" size="sm">Contact</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
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
                  </Button>
                </CardContent>
              </Card>
            </div>
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

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <Heart className="w-12 h-12 text-primary mx-auto" />
            <h3 className="text-xl font-semibold">Holistic Health Analysis</h3>
            <p className="text-muted-foreground">
              Comprehensive Prakriti and health assessments based on traditional Ayurvedic principles
            </p>
          </div>
          <div className="text-center space-y-4">
            <Leaf className="w-12 h-12 text-secondary mx-auto" />
            <h3 className="text-xl font-semibold">Personalized Diet Plans</h3>
            <p className="text-muted-foreground">
              AI-powered diet chart generation tailored to individual dosha constitution and health needs
            </p>
          </div>
          <div className="text-center space-y-4">
            <Users className="w-12 h-12 text-accent mx-auto" />
            <h3 className="text-xl font-semibold">Practice Management</h3>
            <p className="text-muted-foreground">
              Complete patient management system with food database and automated reminders
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;