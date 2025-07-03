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
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage:
            "url(https://cdn.builder.io/api/v1/image/assets%2Ff211fb8c7c124ed3b265fee7bf5c0654%2F0fa8a05f0c6c4a82a14ffab76905b54b)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-full max-w-md space-y-6 flex flex-col">
          {/* Logo Section */}
          <div className="flex flex-col relative min-h-[100px] p-5">
            <section className="flex flex-col relative min-h-[100px] p-5 w-full max-w-[1200px] mx-auto">
              <img
                loading="lazy"
                alt="Bridgit-AI-Logo"
                src="https://cdn.builder.io/api/v1/image/assets%2Ff211fb8c7c124ed3b265fee7bf5c0654%2F30e1349d4cfb419e91a0da6ebdeb868d"
                className="aspect-square object-cover object-center w-full min-h-[150px] max-w-[150px] rounded-[14px] mx-auto mt-5 border-2 border-black"
                style={{
                  boxShadow: "3px 3px 3px 1px rgba(0, 0, 0, 1)",
                }}
              />
            </section>
          </div>

          {/* Auth Card */}
          <HoloCard className="mx-auto" style={{ margin: "24px auto 0" }}>
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

          {/* Auth Component */}
          <HoloCard className="overflow-hidden">
            {showSignUp ? (
              <SignUp routing="hash" afterSignUpUrl="/" />
            ) : (
              <SignIn routing="hash" afterSignInUrl="/" />
            )}
          </HoloCard>

          {/* Action Buttons */}
          <HoloCard>
            <div className="grid grid-cols-2 gap-2 relative">
              <CyberButton
                variant={!showSignUp ? "primary" : "ghost"}
                onClick={() => setShowSignUp(false)}
                className="flex-1 relative"
              >
                <div
                  className="absolute inset-0 rounded-[24px]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(179, 102, 255, 0.2), rgba(51, 204, 255, 0.2))",
                    fontSize: "30px",
                    color: "rgba(0, 0, 0, 1)",
                    textShadow: "1px 1px 3px rgba(255, 255, 255, 1)",
                    fontFamily: "Audiowide, display",
                  }}
                >
                  <span style={{ color: "rgb(0, 0, 0)" }}>SIGN IN</span>
                </div>
              </CyberButton>
              <CyberButton
                variant="ghost"
                onClick={() => setShowSignUp(true)}
                className="flex-1 relative"
                style={{
                  backgroundImage:
                    "url(https://cdn.builder.io/api/v1/image/assets%2Ff211fb8c7c124ed3b265fee7bf5c0654%2F0fa8a05f0c6c4a82a14ffab76905b54b)",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              />
              <div
                className="absolute top-[5px] left-[236px]"
                style={{
                  fontSize: "30px",
                  color: "rgba(0, 0, 0, 1)",
                  textShadow: "1px 1px 3px rgba(255, 255, 255, 1)",
                  fontFamily: "Audiowide, display",
                }}
              >
                <span style={{ color: "rgb(0, 0, 0)" }}>SIGN UP</span>
              </div>
            </div>
          </HoloCard>
        </div>
      </div>
    );
  }

  // User is authenticated - proceed with the app
  return <>{children}</>;
}
