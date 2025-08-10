import Navbar from "@/components/Navbar";
import FirebaseConfigGate from "@/components/FirebaseConfigGate";
import PhoneAuthForm from "@/components/PhoneAuthForm";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  return (
    <FirebaseConfigGate>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto flex items-center justify-center p-6">
          <div className="w-full flex flex-col items-center gap-6">
            <h1 className="text-3xl font-semibold">Secure OTP Login</h1>
            <p className="text-muted-foreground">Sign in with your phone number to book your service.</p>
            <PhoneAuthForm onSuccess={() => navigate("/book")} />
          </div>
        </main>
      </div>
    </FirebaseConfigGate>
  );
}
