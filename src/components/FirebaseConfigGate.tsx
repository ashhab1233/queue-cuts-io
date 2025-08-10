import { ReactNode, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getStoredFirebaseConfig, setStoredFirebaseConfig, initFirebase, type FirebaseWebConfig } from "@/integrations/firebase/client";

interface Props {
  children: ReactNode;
}

export default function FirebaseConfigGate({ children }: Props) {
  const existing = useMemo(() => getStoredFirebaseConfig(), []);
  const [json, setJson] = useState<string>(existing ? JSON.stringify(existing, null, 2) : "");
  const [ready, setReady] = useState<boolean>(!!existing);
  const { toast } = useToast();

  if (ready) return <>{children}</>;

  const onSave = () => {
    try {
      const parsed = JSON.parse(json) as FirebaseWebConfig;
      if (!parsed.apiKey || !parsed.projectId || !parsed.appId || !parsed.authDomain) {
        throw new Error("Missing required fields");
      }
      setStoredFirebaseConfig(parsed);
      const inited = initFirebase();
      if (inited) {
        setReady(true);
        toast({ title: "Firebase connected", description: "You're ready to log in and book." });
      } else {
        throw new Error("Failed to initialize Firebase");
      }
    } catch (e: any) {
      toast({ title: "Invalid config", description: e?.message ?? "Please paste a valid Firebase Web config JSON.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Connect Firebase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Paste your Firebase Web configuration JSON from the Firebase console (Project settings ➝ Your apps ➝ SDK setup and configuration).
            </p>
            <div className="space-y-2">
              <Label htmlFor="cfg">Firebase Web Config (JSON)</Label>
              <textarea
                id="cfg"
                className="w-full min-h-[12rem] rounded-md border border-input bg-background p-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder='{"apiKey":"...","authDomain":"...","projectId":"...","appId":"..."}'
                value={json}
                onChange={(e) => setJson(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={onSave}>Save & Continue</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
