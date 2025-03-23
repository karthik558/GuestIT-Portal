
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Dashboard } from "@/components/dashboard/Dashboard";

export default function Admin() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isAdmin={true} />
      
      <main className="flex-1 page-container pb-16 animate-fade-in">
        <div className="space-y-4 max-w-7xl mx-auto">
          <div>
            <h1 className="heading-1">Admin Dashboard</h1>
            <p className="subtitle">
              Manage WiFi assistance requests and generate reports
            </p>
          </div>
          
          <Dashboard />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
