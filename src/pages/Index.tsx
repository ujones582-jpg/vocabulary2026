import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserPreference } from "@/hooks/useUserPreference";
import WordBankSelection from "./WordBankSelection";
import { Loader2 } from "lucide-react";

export default function Index() {
  const { bank, loading, hasPreference } = useUserPreference();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && hasPreference && bank) {
      navigate(`/learn?bank=${bank}`, { replace: true });
    }
  }, [loading, hasPreference, bank, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (hasPreference) return null; // will redirect

  return <WordBankSelection />;
}
