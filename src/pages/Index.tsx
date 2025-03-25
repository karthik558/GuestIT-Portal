import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GuestForm } from "@/components/GuestForm";
import { RequestTracker } from "@/components/RequestTracker";
import { Hero } from "@/components/ui/hero";

export default function Index() {
  const [activeTab, setActiveTab] = useState<string>("guest");
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        <Hero
          title="Hotel WiFi Support Portal"
          subtitle="Experiencing issues with your WiFi connection? Our dedicated support team is here to help. Submit a request or track your existing request status."
          className="min-h-[50vh]"
        />
        
        <section className="py-8 md:py-12" id="guest-form">
          <div className="page-container">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="max-w-3xl mx-auto"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="guest">Submit Request</TabsTrigger>
                <TabsTrigger value="track">Track Request</TabsTrigger>
              </TabsList>
              
              <TabsContent value="guest" className="mt-8">
                <GuestForm />
              </TabsContent>
              
              <TabsContent value="track" className="mt-8">
                <RequestTracker />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
