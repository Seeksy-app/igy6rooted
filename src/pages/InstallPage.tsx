import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Smartphone, Share } from "lucide-react";

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Smartphone className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">App Installed! ✅</h1>
        <p className="text-muted-foreground mb-6">Open IGY6 Knock from your home screen to start door knocking.</p>
        <a href="/knock">
          <Button size="lg">Open App →</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6 text-center">
        <Smartphone className="h-16 w-16 text-primary mx-auto" />
        <h1 className="text-2xl font-bold">Install IGY6 Door Knocker</h1>
        <p className="text-muted-foreground">
          Install this app on your phone to quickly log door knocks with GPS address detection.
        </p>

        {deferredPrompt && (
          <Button size="lg" onClick={handleInstall} className="w-full h-14 text-lg gap-2">
            <Download className="h-5 w-5" /> Install App
          </Button>
        )}

        {isIOS && (
          <Card>
            <CardContent className="pt-4 space-y-4 text-left">
              <h2 className="font-semibold text-center">Install on iPhone/iPad</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold shrink-0">1</span>
                  <p className="text-sm">Tap the <Share className="h-4 w-4 inline" /> <strong>Share</strong> button at the bottom of Safari</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold shrink-0">2</span>
                  <p className="text-sm">Scroll down and tap <strong>"Add to Home Screen"</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold shrink-0">3</span>
                  <p className="text-sm">Tap <strong>"Add"</strong> in the top right corner</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!isIOS && !deferredPrompt && (
          <Card>
            <CardContent className="pt-4 space-y-4 text-left">
              <h2 className="font-semibold text-center">Install on Android</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold shrink-0">1</span>
                  <p className="text-sm">Tap the <strong>⋮ menu</strong> in Chrome</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold shrink-0">2</span>
                  <p className="text-sm">Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold shrink-0">3</span>
                  <p className="text-sm">Confirm and open from your home screen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-muted-foreground">
          Already have the app? <a href="/knock" className="underline">Open Door Knocker →</a>
        </p>
      </div>
    </div>
  );
}
