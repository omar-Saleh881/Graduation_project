// ⚠️ This file is an orphaned debug/development tool for inspecting the external Supabase `mbx` table schema.
// It is NOT routed in App.tsx and NOT used in production.
// Retained for reference — can be safely deleted if no longer needed.

import { useEffect, useState } from "react";
import { externalSupabase } from "@/lib/external-supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SchemaInfo {
  columns: any[];
  sampleRow: any;
  rowCount: number | null;
}

const Index = () => {
  const [schema, setSchema] = useState<SchemaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const inspect = async () => {
      const { data: sample, error: sampleErr } = await externalSupabase
        .from("mbx")
        .select("*")
        .limit(1);

      if (sampleErr) {
        setError(sampleErr.message);
        setLoading(false);
        return;
      }

      const { count, error: countErr } = await externalSupabase
        .from("mbx")
        .select("*", { count: "exact", head: true });

      if (sample && sample.length > 0) {
        const row = sample[0];
        const columns = Object.entries(row).map(([key, value]) => ({
          name: key,
          jsType: value === null ? "null" : typeof value,
          sampleValue:
            value === null
              ? "NULL"
              : typeof value === "object"
              ? JSON.stringify(value).slice(0, 80)
              : String(value).slice(0, 80),
        }));
        setSchema({
          columns,
          sampleRow: row,
          rowCount: countErr ? null : count,
        });
      } else {
        setError("Table mbx exists but has no rows.");
      }
      setLoading(false);
    };
    inspect();
  }, []);

  return (
    <div className="flex min-h-screen items-start justify-center bg-background p-8">
      <div className="w-full max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-foreground">
          Schema Analysis: <code className="text-primary">mbx</code>
        </h1>

        {loading && <p className="text-muted-foreground">Inspecting table…</p>}
        {error && <p className="text-destructive">{error}</p>}

        {schema && (
          <>
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-2 text-lg font-semibold text-card-foreground">Summary</h2>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><strong>Table:</strong> public.mbx</li>
                <li><strong>Total rows:</strong> {schema.rowCount ?? "Unable to count"}</li>
                <li><strong>Columns:</strong> {schema.columns.length}</li>
              </ul>
            </div>

            <div className="rounded-lg border border-border">
              <h2 className="p-4 text-lg font-semibold text-foreground">Column Details</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Column Name</TableHead>
                    <TableHead>JS Type (inferred)</TableHead>
                    <TableHead>Sample Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schema.columns.map((col, i) => (
                    <TableRow key={col.name}>
                      <TableCell className="font-mono text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-mono font-semibold">{col.name}</TableCell>
                      <TableCell className="text-muted-foreground">{col.jsType}</TableCell>
                      <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                        {col.sampleValue}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
