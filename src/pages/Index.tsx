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
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      
      <main className="flex-1 w-full">
        <Hero
          title="Hotel WiFi Support Portal"
          subtitle="Experiencing issues with your WiFi connection? Our dedicated support team is here to help. Submit a request or track your existing request status."
          className="min-h-[50vh]"
        />
        
        <section className="py-8 md:py-12 px-4 md:px-6 lg:px-8" id="guest-form">
          <div className="mx-auto max-w-full md:max-w-6xl lg:max-w-7xl">
            <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="mx-auto"
              >
                <div className="flex justify-center">
                  <TabsList className="inline-flex w-auto">
                    <TabsTrigger value="guest">Submit Request</TabsTrigger>
                    <TabsTrigger value="track">Track Request</TabsTrigger>
                  </TabsList>
                </div>
                
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
