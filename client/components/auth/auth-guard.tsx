import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import { ReactNode, useState } from "react";
import { HoloCard } from "../ui/holo-card";
import { CyberButton } from "../ui/cyber-button";
import { User, UserPlus, Zap, Shield } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
}

// Step 1: Auth → Clerk enforcement
export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoaded, isSignedIn, user } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neubg cyber-bg">
        <HoloCard className="w-full max-w-md text-center space-y-6" glow>
          <div className="animate-spin w-8 h-8 border-2 border-bridgit-primary border-t-transparent rounded-full mx-auto"></div>
          <div className="text-lg font-semibold text-foreground">
            Initializing Bridgit AI...
          </div>
          <div className="text-sm text-muted-foreground">
            Connecting to neural networks
          </div>
        </HoloCard>
      </div>
    );
  }

  // Authentication required - Step 1 of the flow
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neubg cyber-bg p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <HoloCard className="text-center space-y-4" variant="premium" glow>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground animate-neon-glow">
                Bridgit AI
              </h1>
              <p className="text-sm text-bridgit-primary">
                Neural Translation Hub
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="space-y-2">
                <Shield className="h-6 w-6 text-bridgit-primary mx-auto" />
                <div className="text-xs text-muted-foreground">Secure</div>
              </div>
              <div className="space-y-2">
                <Zap className="h-6 w-6 text-bridgit-gold mx-auto" />
                <div className="text-xs text-muted-foreground">Instant</div>
              </div>
              <div className="space-y-2">
                <User className="h-6 w-6 text-bridgit-neon mx-auto" />
                <div className="text-xs text-muted-foreground">Personal</div>
              </div>
            </div>

            <div className="p-4 bg-bridgit-primary/10 rounded-neu border border-bridgit-primary/20">
              <p className="text-sm text-foreground font-medium">
                🔐 Authentication Required
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Sign in to access real-time voice translation
              </p>
            </div>
          </HoloCard>

          {/* Auth Toggle */}
          <HoloCard className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <CyberButton
                variant={!showSignUp ? "primary" : "ghost"}
                onClick={() => setShowSignUp(false)}
                className="flex-1"
              >
                <User className="h-4 w-4" />
                Sign In
              </CyberButton>
              <CyberButton
                variant={showSignUp ? "gold" : "ghost"}
                onClick={() => setShowSignUp(true)}
                className="flex-1"
              >
                <UserPlus className="h-4 w-4" />
                Sign Up
              </CyberButton>
            </div>
          </HoloCard>

          {/* Auth Component */}
          <HoloCard className="overflow-hidden">
            {showSignUp ? (
              <SignUp routing="hash" afterSignUpUrl="/" />
            ) : (
              <SignIn routing="hash" afterSignInUrl="/" />
            )}
          </HoloCard>

          {/* Features */}
          <HoloCard className="text-center space-y-3" variant="ghost">
            <h3 className="text-sm font-semibold text-bridgit-primary">
              What You Get
            </h3>
            <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
              <div>✨ Real-time voice translation</div>
              <div>🌍 36+ supported languages</div>
              <div>🔊 Premium AI voices</div>
              <div>📱 Remote session sharing</div>
              <div>⚡ 50 free tokens to start</div>
            </div>
          </HoloCard>
        </div>
      </div>
    );
  }

  // User is authenticated - proceed with the app
  return <>{children}</>;
}
