import { useEffect } from "react";

const VoiceAgentTestPage = () => {
  useEffect(() => {
    // Load the ElevenLabs widget script
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
    script.async = true;
    script.type = "text/javascript";
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Voice Agent Test
        </h1>
        <p className="text-muted-foreground">
          Click the widget in the bottom-right corner to start a conversation
        </p>
      </div>

      {/* ElevenLabs Conversational AI Widget */}
      <elevenlabs-convai agent-id="agent_4501kesdr7x3ff1rkg0cqnmvpsed"></elevenlabs-convai>
    </div>
  );
};

export default VoiceAgentTestPage;
