import { VoiceAgentInterface } from "@/components/voice/VoiceAgentInterface";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const VoiceAgentTestPage = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Voice Agent Test
          </h1>
          <p className="text-muted-foreground">
            Test the AI scheduling assistant with real-time voice conversation
          </p>
        </div>

        {/* Voice Interface */}
        <VoiceAgentInterface />

        {/* Instructions */}
        <div className="mt-8 rounded-lg border bg-muted/30 p-6">
          <h3 className="font-semibold mb-3">How to use:</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Click "Start Conversation" to connect to the voice agent</li>
            <li>Allow microphone access when prompted</li>
            <li>Speak naturally - the agent will respond in real-time</li>
            <li>Your conversation will be transcribed and displayed above</li>
            <li>Click "End Call" when you're done</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgentTestPage;
