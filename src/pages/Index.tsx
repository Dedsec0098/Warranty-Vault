import { Link } from "react-router-dom";
import { ArrowRight, Check, FileText, Scan, Shield, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { token, logout } = useAuth();

  const features = [
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: "Centralized Storage",
      description:
        "Store all your warranties in one secure location, accessible anytime, anywhere.",
    },
    {
      icon: <Scan className="h-10 w-10 text-primary" />,
      title: "OCR Document Scanning",
      description:
        "Automatically extract warranty details from receipts and documents with our advanced OCR technology.",
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Never Miss a Claim",
      description:
        "Get timely reminders before warranties expire to ensure you never miss a claim opportunity.",
    },
  ];

  const handleScrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-b from-primary/10 to-background px-6 py-16 lg:py-24">
        <div className="container mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-2 md:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                <span className="block">WARRANTY</span>
                <span className="block text-primary">VAULT</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Never lose track of your warranties again. Simplify warranty management with digital
                storage, automated reminders, and OCR document scanning.
              </p>
              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                {token ? (
                  <>
                    <Button asChild size="lg" className="gap-2">
                      <Link to="/dashboard">
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" onClick={logout}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild size="lg" className="gap-2">
                      <Link to="/register">
                        Get Started
                        <UserPlus className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                       <Link to="/login">
                         Login
                         <LogIn className="h-4 w-4 ml-2" />
                       </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute -left-4 -top-4 h-72 w-72 rounded-full bg-primary/10 blur-3xl"></div>
                <div className="relative z-10 rounded-xl bg-white p-4 shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Warranty Management"
                    className="rounded-lg object-cover"
                    width={400}
                    height={300}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simplify Warranty Management
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Warranty Vault helps you keep track of all your product warranties
              in one place, ensuring you never miss a claim opportunity.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted py-16 lg:py-24">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-2 md:gap-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Why Choose WARRANTY VAULT?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Our platform is designed to eliminate warranty mismanagement,
                helping you save money by ensuring you never miss out on warranty
                claims.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Never lose track of warranty documents",
                  "Get timely reminders before warranties expire",
                  "Extract warranty details automatically with OCR",
                  "Access your warranties anytime, anywhere",
                  "Categorize and search warranties easily",
                  "Share warranty details with family members",
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {!token && (
                  <Button asChild size="lg">
                    <Link to="/register">Start Organizing</Link>
                  </Button>
                )}
              </div>
            </div>
            <div className="order-first md:order-last">
              <div className="relative mx-auto max-w-md overflow-hidden rounded-xl shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Organize your warranties"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="rounded-2xl bg-primary/5 p-8 text-center sm:p-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {token ? 'Manage Your Warranties' : 'Ready to Get Started?'}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              {token
                ? 'Go to your dashboard to view and add warranties.'
                : 'Join thousands of users who have simplified their warranty management with Warranty Vault.'}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              {token ? (
                 <Button asChild size="lg" className="gap-2">
                   <Link to="/dashboard">
                     Go to Dashboard
                     <ArrowRight className="h-4 w-4" />
                   </Link>
                 </Button>
              ) : (
                <Button asChild size="lg" className="gap-2">
                  <Link to="/register">
                    Start Using Warranty Vault
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">WARRANTY VAULT</span>
            </div>
            <div className="text-center text-sm text-muted-foreground sm:text-right">
              &copy; {new Date().getFullYear()} Warranty Vault. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
