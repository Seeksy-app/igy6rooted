import { useConversation } from "@elevenlabs/react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface TranscriptEntry {
  id: string;
  role: "user" | "agent";
  text: string;
  timestamp: Date;
}

export function VoiceAgentInterface() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [currentUserText, setCurrentUserText] = useState("");
  const [currentAgentText, setCurrentAgentText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs agent");
      toast({
        title: "Connected",
        description: "Voice agent is ready. Start speaking!",
      });
    },
    onDisconnect: () => {
      console.log("Disconnected from agent");
      setCurrentUserText("");
      setCurrentAgentText("");
    },
    onMessage: (message) => {
      console.log("Message received:", message);
      const msg = message as unknown as Record<string, unknown>;
      const messageType = msg.type as string | undefined;
      
      if (messageType === "user_transcript") {
        const event = msg.user_transcription_event as { user_transcript?: string } | undefined;
        const transcript = event?.user_transcript;
        if (transcript) {
          setTranscripts((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "user",
              text: transcript,
              timestamp: new Date(),
            },
          ]);
          setCurrentUserText("");
        }
      } else if (messageType === "agent_response") {
        const event = msg.agent_response_event as { agent_response?: string } | undefined;
        const response = event?.agent_response;
        if (response) {
          setTranscripts((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "agent",
              text: response,
              timestamp: new Date(),
            },
          ]);
          setCurrentAgentText("");
        }
      } else if (messageType === "transcript") {
        // Handle partial transcripts
        const role = msg.role as string | undefined;
        const text = msg.text as string | undefined;
        if (role === "user") {
          setCurrentUserText(text || "");
        } else if (role === "agent") {
          setCurrentAgentText(text || "");
        }
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to voice agent. Please try again.",
      });
      setIsConnecting(false);
    },
  });

  // Auto-scroll to bottom when new transcripts arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts, currentUserText, currentAgentText]);

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get token from edge function
      const { data, error } = await supabase.functions.invoke(
        "elevenlabs-conversation-token"
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.token) {
        throw new Error("No token received from server");
      }

      // Start the conversation with WebRTC
      await conversation.startSession({
        conversationToken: data.token,
        connectionType: "webrtc",
      });
    } catch (error: any) {
      console.error("Failed to start conversation:", error);
      toast({
        variant: "destructive",
        title: "Failed to Start",
        description: error.message || "Could not start the voice conversation.",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, toast]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
    toast({
      title: "Disconnected",
      description: "Voice conversation ended.",
    });
  }, [conversation, toast]);

  const toggleMute = useCallback(async () => {
    if (isMuted) {
      await conversation.setVolume({ volume: 1 });
    } else {
      await conversation.setVolume({ volume: 0 });
    }
    setIsMuted(!isMuted);
  }, [conversation, isMuted]);

  const isConnected = conversation.status === "connected";

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div
              className={cn(
                "h-3 w-3 rounded-full transition-colors",
                isConnected
                  ? conversation.isSpeaking
                    ? "bg-primary animate-pulse"
                    : "bg-green-500"
                  : "bg-muted"
              )}
            />
            Voice Agent
          </CardTitle>
          <div className="flex items-center gap-2">
            {isConnected && (
              <Badge variant={conversation.isSpeaking ? "default" : "secondary"}>
                {conversation.isSpeaking ? "Speaking" : "Listening"}
              </Badge>
            )}
            <Badge variant="outline">
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Transcript Display */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <ScrollArea className="h-[300px] pr-4" ref={scrollRef}>
            {transcripts.length === 0 && !currentUserText && !currentAgentText ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <p className="text-center">
                  {isConnected
                    ? "Start speaking to begin the conversation..."
                    : "Click 'Start Conversation' to begin"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transcripts.map((entry) => (
                  <div
                    key={entry.id}
                    className={cn(
                      "flex flex-col gap-1",
                      entry.role === "user" ? "items-end" : "items-start"
                    )}
                  >
                    <span className="text-xs text-muted-foreground">
                      {entry.role === "user" ? "You" : "Agent"}
                    </span>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                        entry.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}
                    >
                      {entry.text}
                    </div>
                  </div>
                ))}

                {/* Live transcription indicators */}
                {currentUserText && (
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-xs text-muted-foreground">You (speaking...)</span>
                    <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-primary/50 text-primary-foreground animate-pulse">
                      {currentUserText}
                    </div>
                  </div>
                )}

                {currentAgentText && (
                  <div className="flex flex-col gap-1 items-start">
                    <span className="text-xs text-muted-foreground">Agent (responding...)</span>
                    <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-secondary/50 text-secondary-foreground animate-pulse">
                      {currentAgentText}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Audio Visualization Placeholder */}
        {isConnected && (
          <div className="flex items-center justify-center gap-1 h-12">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1 rounded-full bg-primary transition-all duration-150",
                  conversation.isSpeaking
                    ? "animate-pulse"
                    : ""
                )}
                style={{
                  height: conversation.isSpeaking
                    ? `${Math.random() * 100}%`
                    : "20%",
                  animationDelay: `${i * 50}ms`,
                }}
              />
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isConnected ? (
            <Button
              onClick={startConversation}
              disabled={isConnecting}
              size="lg"
              className="gap-2"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="h-5 w-5" />
                  Start Conversation
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleMute}
                className="h-12 w-12"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="destructive"
                size="lg"
                onClick={stopConversation}
                className="gap-2"
              >
                <PhoneOff className="h-5 w-5" />
                End Call
              </Button>

              <div className="h-12 w-12 flex items-center justify-center">
                {conversation.isSpeaking ? (
                  <Volume2 className="h-5 w-5 text-primary animate-pulse" />
                ) : (
                  <Mic className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </>
          )}
        </div>

        {/* Clear Transcript */}
        {transcripts.length > 0 && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTranscripts([])}
              className="text-muted-foreground"
            >
              Clear Transcript
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
