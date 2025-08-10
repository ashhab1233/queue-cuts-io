import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="container mx-auto px-6 py-20 grid gap-10 md:grid-cols-2 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">Fast Barber Booking with OTP and Real‑Time Tokens</h1>
            <p className="text-lg text-muted-foreground">Book a haircut, beard trim, or shave in seconds. Get an instant daily token and track your place in the queue in real time.</p>
            <div className="flex gap-3">
              <Button asChild>
                <Link to="/login">Start Booking</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/admin">Open Admin</Link>
              </Button>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-3 text-sm">
                <li>• Secure phone OTP login</li>
                <li>• Auto-assigned daily tokens</li>
                <li>• Real-time barber dashboard</li>
                <li>• Estimated waiting time</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">© {new Date().getFullYear()} BarberQ</footer>
    </div>
  );
};

export default Index;
