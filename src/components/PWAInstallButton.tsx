import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Detect iOS
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as any).MSStream;
    setIsIOS(ios);

    // Check installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    // Listen install event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      console.log("📱 Install available");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  // ❌ don't show if installed or dismissed
  if (isInstalled || !visible) return null;

  // 🍎 iOS UI
  if (isIOS) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 flex items-center gap-3 bg-blue-500 text-white px-4 py-3 rounded-xl shadow-lg">
        <Download className="h-5 w-5" />
        <div className="text-sm">
          <p className="font-bold">Install NaariCare</p>
          <p className="text-xs">Tap Share ↑ → Add to Home Screen</p>
        </div>
        <button onClick={handleDismiss}>
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // 🤖 Android UI (ALWAYS SHOW)
  return (
    <div className="fixed bottom-20 right-4 z-50 flex items-center gap-3 bg-pink-500 text-white px-4 py-3 rounded-xl shadow-lg animate-bounce">
      <Download className="h-5 w-5" />

      <div>
        <p className="text-sm font-bold">Install NaariCare</p>
        <p className="text-xs">Add to home screen</p>
      </div>

      {deferredPrompt ? (
        <button
          onClick={handleInstallClick}
          className="bg-white text-pink-600 px-3 py-1 rounded text-sm"
        >
          Install
        </button>
      ) : (
        <span className="text-xs">Open in Chrome</span>
      )}

      <button onClick={handleDismiss}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
