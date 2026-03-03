"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTripStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, ArrowRight, MapPin, Calendar } from 'lucide-react';
import AppLayout from '@/components/layout/app-layout';
import { GoogleGenAI } from "@google/genai";
import { toast } from 'sonner';
import { addDays, format } from 'date-fns';

export default function AIBuilderPage() {
  return (
    <AppLayout>
      <AIBuilderContent />
    </AppLayout>
  );
}

function AIBuilderContent() {
  const router = useRouter();
  const addTrip = useTripStore((state) => state.addTrip);
  const addActivity = useTripStore((state) => state.addActivity);

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTrip, setGeneratedTrip] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setGeneratedTrip(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });
      const systemPrompt = `
        You are a travel assistant. Generate a trip itinerary based on the user's prompt.
        Return ONLY valid JSON with no markdown formatting.
        Structure:
        {
          "name": "Trip Name",
          "destination": "City, Country",
          "durationDays": number,
          "activities": [
            {
              "dayIndex": number (0-based),
              "title": "Activity Name",
              "startTime": "HH:MM",
              "endTime": "HH:MM",
              "location": "Address or Place Name",
              "notes": "Short description",
              "estimatedCost": number (in USD, approximate)
            }
          ]
        }
        If the prompt doesn't specify duration, assume 3 days.
        If the prompt doesn't specify dates, assume starting tomorrow.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: systemPrompt + "\n\nUser Prompt: " + prompt }] }
        ]
      });
      
      const text = response.text;
      
      if (!text) throw new Error("No response from AI");

      // Clean up markdown code blocks if present
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(jsonStr);
      
      setGeneratedTrip(data);
      toast.success("Trip draft generated!");
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast.error("Failed to generate trip. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateTrip = async () => {
    if (!generatedTrip) return;

    const startDate = new Date();
    const endDate = addDays(startDate, generatedTrip.durationDays - 1);

    const tripId = await addTrip({
      name: generatedTrip.name,
      destination: generatedTrip.destination,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      timezone: 'UTC', // Default
    });

    await Promise.all(generatedTrip.activities.map((activity: any, index: number) => {
      return addActivity({
        tripId,
        dayIndex: activity.dayIndex,
        title: activity.title,
        startTime: activity.startTime,
        endTime: activity.endTime,
        location: activity.location,
        notes: activity.notes,
        estimatedCost: activity.estimatedCost,
        order: index,
      });
    }));

    toast.success("Trip created successfully!");
    router.push(`/trip/${tripId}/overview`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-coral to-yellow rounded-2xl shadow-lg mb-4">
          <Sparkles className="w-8 h-8 text-white animate-pulse-slow" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-black text-ink">
          AI Trip Builder
        </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Tell us where you want to go, and we&apos;ll draft a complete itinerary for you in seconds.
          </p>
      </div>

      <Card className="border-2 border-soft shadow-lg overflow-hidden">
        <div className="p-1 bg-gradient-to-r from-coral via-yellow to-mint opacity-20" />
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-muted">Your Dream Trip</label>
            <Textarea 
              placeholder="e.g. A romantic weekend in Paris for 2 people, budget $2000, interested in art and food."
              className="min-h-[120px] text-lg p-4 resize-none border-soft focus:border-coral transition-colors"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              size="lg" 
              onClick={handleGenerate} 
              disabled={isGenerating || !prompt.trim()}
              className="bg-ink text-cream hover:bg-ink/90 shadow-xl w-full md:w-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Dreaming up your trip...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Itinerary
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedTrip && (
        <div 
          className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold">Draft Preview</h2>
            <Button onClick={handleCreateTrip} variant="coral" size="lg">
              Create Trip <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <div className="bg-ink p-6 text-cream">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-display font-bold mb-2">{generatedTrip.name}</h3>
                  <div className="flex items-center gap-4 text-white/70">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {generatedTrip.destination}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {generatedTrip.durationDays} Days</span>
                  </div>
                </div>
                <Badge variant="mint" className="text-ink">Draft</Badge>
              </div>
            </div>
            
            <CardContent className="p-0">
              <div className="divide-y divide-soft">
                {generatedTrip.activities.map((activity: any, i: number) => (
                  <div key={i} className="p-4 flex gap-4 hover:bg-soft/30 transition-colors">
                    <div className="w-16 flex-shrink-0 flex flex-col items-center justify-center bg-soft rounded-xl h-16">
                      <span className="text-xs font-bold uppercase text-muted">Day</span>
                      <span className="text-xl font-display font-bold text-ink">{activity.dayIndex + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-lg text-ink">{activity.title}</h4>
                        <span className="font-mono text-sm font-medium text-muted">{activity.startTime}</span>
                      </div>
                      <p className="text-sm text-ink/70 mb-2">{activity.notes}</p>
                      <div className="flex gap-2">
                        {activity.location && <Badge variant="outline" className="text-xs">{activity.location}</Badge>}
                        {activity.estimatedCost > 0 && <Badge variant="yellow" className="text-xs text-ink">~${activity.estimatedCost}</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
