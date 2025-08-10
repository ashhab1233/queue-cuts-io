import Navbar from "@/components/Navbar";
import FirebaseConfigGate from "@/components/FirebaseConfigGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, onSnapshot, query, where, collection } from "firebase/firestore";
import { getFirebase, getTodayKey } from "@/integrations/firebase/client";

const DURATIONS: Record<string, number> = {
  "Haircut": 30,
  "Beard Trim": 15,
  "Shave": 20,
};

export default function Confirm() {
  const { id } = useParams();
  const [booking, setBooking] = useState<any | null>(null);
  const [aheadCount, setAheadCount] = useState(0);

  useEffect(() => {
    const { db } = getFirebase();
    if (!id) return;
    const ref = doc(db, "bookings", id);
    const unsub = onSnapshot(ref, (snap) => setBooking(snap.exists() ? { id: snap.id, ...snap.data() } : null));
    return () => unsub();
  }, [id]);

  useEffect(() => {
    if (!booking) return;
    const { db } = getFirebase();
    const today = getTodayKey();
    const q = query(collection(db, "bookings"), where("date", "==", today));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
      const ahead = items.filter((b) => (b.token_number ?? 0) < (booking.token_number ?? 0) && !["Completed", "Cancelled"].includes(b.status)).length;
      setAheadCount(ahead);
    });
    return () => unsub();
  }, [booking?.token_number]);

  const eta = useMemo(() => {
    if (!booking) return null;
    const per = DURATIONS[booking.service as string] ?? 20;
    return aheadCount * per;
  }, [aheadCount, booking?.service]);

  return (
    <FirebaseConfigGate>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto p-6">
          {!booking ? (
            <p className="text-muted-foreground">Loading booking...</p>
          ) : (
            <Card className="max-w-xl mx-auto">
              <CardHeader>
                <CardTitle>Your Booking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Token</span>
                  <span className="text-3xl font-semibold">{booking.token_number}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div>{booking.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Service</div>
                    <div>{booking.service}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Badge>{booking.status}</Badge>
                  </div>
                </div>
                {eta !== null && (
                  <p className="text-sm text-muted-foreground">Estimated wait: ~{eta} minutes</p>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </FirebaseConfigGate>
  );
}
