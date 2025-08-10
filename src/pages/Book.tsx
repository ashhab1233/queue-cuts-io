import Navbar from "@/components/Navbar";
import FirebaseConfigGate from "@/components/FirebaseConfigGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getFirebase, getTodayKey } from "@/integrations/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Book() {
  const [name, setName] = useState("");
  const [service, setService] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [canBook, setCanBook] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const { auth } = getFirebase();
      const unsub = onAuthStateChanged(auth, (user) => {
        setCanBook(!!user);
        if (!user) navigate("/login");
      });
      return () => unsub();
    } catch {
      // handled by gate
    }
  }, [navigate]);

  const submit = async () => {
    try {
      setLoading(true);
      const { auth, db } = getFirebase();
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in");
      const today = getTodayKey();

      const bookingId = await runTransaction(db, async (tx) => {
        const settingsRef = doc(db, "settings", today);
        const settingsSnap = await tx.get(settingsRef);
        const last = (settingsSnap.exists() ? (settingsSnap.data().last_token_number as number) : 0) || 0;
        const next = last + 1;
        tx.set(settingsRef, { date: today, last_token_number: next }, { merge: true });

        const bookingsCol = collection(db, "bookings");
        const bookingRef = doc(bookingsCol);
        tx.set(bookingRef, {
          token_number: next,
          date: today,
          name,
          phone: user.phoneNumber,
          service,
          status: "Queued",
          uid: user.uid,
          created_at: serverTimestamp(),
        });
        return bookingRef.id;
      });

      toast({ title: "Booked", description: "Your token has been created." });
      navigate(`/confirm/${bookingId}`);
    } catch (e: any) {
      toast({ title: "Booking failed", description: e?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FirebaseConfigGate>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto p-6">
          <div className="max-w-xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Book a Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Service</Label>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Haircut">Haircut</SelectItem>
                      <SelectItem value="Beard Trim">Beard Trim</SelectItem>
                      <SelectItem value="Shave">Shave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button disabled={!canBook || !name || !service || loading} onClick={submit} className="w-full">
                  {loading ? "Booking..." : "Confirm Booking"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </FirebaseConfigGate>
  );
}
