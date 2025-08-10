import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getFirebase } from "@/integrations/firebase/client";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

interface Props {
  onSuccess?: () => void;
}

export default function PhoneAuthForm({ onSuccess }: Props) {
  const [phone, setPhone] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const confirmationResult = useRef<ConfirmationResult | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Prepare reCAPTCHA verifier lazily
    try {
      const { auth } = getFirebase();
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
        });
      }
    } catch {
      // No firebase yet (gate will handle)
    }
  }, []);

  const sendCode = async () => {
    try {
      setSending(true);
      const { auth } = getFirebase();
      const appVerifier = window.recaptchaVerifier!;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      confirmationResult.current = result;
      setStep("otp");
      toast({ title: "OTP sent", description: "Please enter the code you received." });
    } catch (e: any) {
      toast({ title: "Failed to send OTP", description: e?.message ?? "Please check the phone number.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async () => {
    try {
      setVerifying(true);
      const result = await confirmationResult.current?.confirm(code);
      if (result?.user) {
        toast({ title: "Logged in", description: "You can now book a service." });
        onSuccess?.();
      }
    } catch (e: any) {
      toast({ title: "Invalid code", description: e?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login with Phone</CardTitle>
      </CardHeader>
      <CardContent>
        {step === "phone" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" placeholder="e.g. +15551234567" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <p className="text-xs text-muted-foreground">Include country code, e.g., +1, +91.</p>
            </div>
            <Button className="w-full" onClick={sendCode} disabled={!phone || sending}>
              {sending ? "Sending..." : "Send OTP"}
            </Button>
            <div id="recaptcha-container" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Enter OTP</Label>
              <Input id="code" placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <Button className="w-full" onClick={verifyCode} disabled={!code || verifying}>
              {verifying ? "Verifying..." : "Verify & Continue"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
