
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GuestForm } from "@/components/GuestForm";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-accent/20 pt-16 pb-24 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-8">
            <div className="md:w-1/2 space-y-6 animate-fade-in">
              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Hotel Guest Services
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight">
                Instant WiFi Support
              </h1>
              <p className="text-xl text-muted-foreground">
                We're here to make your stay more connected. Request assistance with your WiFi and our IT team will help you immediately.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="rounded-lg">
                  <a href="#request-form">Request WiFi Help</a>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-lg">
                  <Link to="/login">Admin Login</Link>
                </Button>
              </div>
            </div>
            
            <div className="hidden md:block md:w-1/2 animate-slide-in">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1484712401471-05c7215830eb?auto=format&fit=crop&q=80&w=2574&ixlib=rb-4.0.3" 
                  alt="Hotel WiFi" 
                  className="w-full h-auto object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="heading-2 mb-12">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 flex flex-col items-center animate-scale-in">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Submit a Request</h3>
                <p className="text-muted-foreground">
                  Fill out the quick form with your information and WiFi issue details.
                </p>
              </div>
              
              <div className="p-6 flex flex-col items-center animate-scale-in" style={{ animationDelay: "0.1s" }}>
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant Notification</h3>
                <p className="text-muted-foreground">
                  Our IT team receives your request immediately and begins working on it.
                </p>
              </div>
              
              <div className="p-6 flex flex-col items-center animate-scale-in" style={{ animationDelay: "0.2s" }}>
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Quick Resolution</h3>
                <p className="text-muted-foreground">
                  Get back online quickly with personalized assistance from our IT specialists.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Request Form Section */}
        <section id="request-form" className="py-16 bg-accent/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="heading-2 mb-2">Request WiFi Assistance</h2>
              <p className="subtitle max-w-2xl mx-auto">
                Fill out this form and our IT team will respond promptly to help you get connected.
              </p>
            </div>
            
            <Tabs defaultValue="guest" className="max-w-3xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="guest">Guest Request</TabsTrigger>
                <TabsTrigger value="admin">Admin Access</TabsTrigger>
              </TabsList>
              
              <TabsContent value="guest">
                <GuestForm />
              </TabsContent>
              
              <TabsContent value="admin">
                <div className="form-container text-center py-12">
                  <h3 className="heading-3 mb-4">Admin Access Required</h3>
                  <p className="text-muted-foreground mb-6">
                    You need administrator privileges to access the dashboard and manage WiFi requests.
                  </p>
                  <Button asChild>
                    <Link to="/login">Log In as Admin</Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
