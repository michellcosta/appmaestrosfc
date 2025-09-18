import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@/components/ui/select";

const InviteCreator: React.FC = () => {
  const [email, setEmail] = useState("");
  const [type, setType] = useState<"mensalista"|"diarista">("mensalista");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createInvite = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/invite/create", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ email, membership: type })
      });
      const data = await res.json();
      setInviteUrl(data.url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <h3 className="text-lg font-semibold">Criar convite</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          <Input
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            placeholder="Email do convidado"
          />
          <Select value={type} onValueChange={(v)=>setType(v as "mensalista"|"diarista")}>
            <SelectTrigger><SelectValue placeholder="Tipo do convite" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mensalista">Mensalista</SelectItem>
              <SelectItem value="diarista">Diarista</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={createInvite} disabled={loading || !email}>
          {loading ? "Gerando..." : "Gerar convite"}
        </Button>

        {inviteUrl && (
          <div className="grid sm:grid-cols-[1fr_auto_auto] gap-2">
            <Input readOnly value={inviteUrl} />
            <Button
              variant="secondary"
              onClick={()=>navigator.clipboard.writeText(inviteUrl)}
              title="Copiar link"
            >
              Copiar
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open("https://wa.me/?text=")}
              title="Enviar por WhatsApp"
            >
              WhatsApp
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InviteCreator;
