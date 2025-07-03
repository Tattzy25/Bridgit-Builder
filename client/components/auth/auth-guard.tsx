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
            <div
              className="w-fit mx-auto"
              style={{
                backgroundColor: "rgba(17, 17, 23, 0.9)",
                borderRadius: "8px",
                boxShadow: "3px 3px 2px 1px rgba(189, 16, 224, 1)",
                border: "1.11111px solid rgba(189, 16, 224, 1)",
                padding: "32px 40px",
                backdropFilter: "blur(24px)",
                textAlign: "center",
              }}
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <h1
                    className="mx-auto"
                    style={{
                      color: "rgba(189, 16, 224, 1)",
                      textShadow: "2px 2px 3px rgba(0, 0, 0, 1)",
                      fontFamily: "Audiowide, display",
                      fontSize: "24px",
                      fontWeight: "700",
                      lineHeight: "24px",
                    }}
                  >
                    VIBE IN !
                  </h1>
                  <p
                    className="mx-auto"
                    style={{
                      fontSize: "18px",
                      fontWeight: "400",
                      lineHeight: "18px",
                      color: "rgb(255, 255, 255)",
                    }}
                  >
                    Vibe. Թարգմանիր. Connecte. 世界.
                  </p>
                </div>
              </div>
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
