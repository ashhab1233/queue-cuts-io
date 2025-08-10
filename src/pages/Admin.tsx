import Navbar from "@/components/Navbar";
import FirebaseConfigGate from "@/components/FirebaseConfigGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getFirebase, getTodayKey } from "@/integrations/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, updateDoc, where, doc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function Admin() {
  const { toast } = useToast();
  const [isAuthed, setIsAuthed] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const { auth } = getFirebase();
    const unsub = onAuthStateChanged(auth, (u) => setIsAuthed(!!u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const { db } = getFirebase();
    const today = getTodayKey();
    const q = query(collection(db, "bookings"), where("date", "==", today));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
      setBookings(items);
    });
    return () => unsub();
  }, []);

  const sorted = useMemo(() => bookings.sort((a, b) => (a.token_number ?? 0) - (b.token_number ?? 0)), [bookings]);

  const setStatus = async (id: string, status: string) => {
    try {
      const { db } = getFirebase();
      await updateDoc(doc(db, "bookings", id), { status });
      toast({ title: "Updated", description: `Status set to ${status}` });
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message ?? "Please try again.", variant: "destructive" });
    }
  };

  return (
    <FirebaseConfigGate>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Barber Dashboard</h1>
            {!isAuthed && (
              <Button asChild>
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Today's Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sorted.map((b) => (
                  <div key={b.id} className="border border-border rounded-md p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">Token</div>
                      <div className="text-xl font-semibold">{b.token_number}</div>
                    </div>
                    <div className="text-sm">{b.name} • {b.phone}</div>
                    <div className="text-sm text-muted-foreground">{b.service}</div>
                    <div className="flex items-center justify-between pt-2">
                      <Badge>{b.status}</Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setStatus(b.id, "In Progress")}>Start</Button>
                        <Button size="sm" onClick={() => setStatus(b.id, "Completed")}>Complete</Button>
                        <Button size="sm" variant="destructive" onClick={() => setStatus(b.id, "Cancelled")}>Cancel</Button>
                      </div>
                    </div>
                  </div>
                ))}
                {sorted.length === 0 && (
                  <p className="text-sm text-muted-foreground">No bookings yet today.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </FirebaseConfigGate>
  );
}
