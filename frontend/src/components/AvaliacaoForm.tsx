import StarRating from "@/components/ui/StarRating";
import TextAreaComentario from "@/components/ui/TextAreaComentario";
import SubmitButton from "@/components/ui/SubmitButton";
import ErrorAlert from "@/components/ui/ErrorAlert";
import type { SubmitStatus } from "@/types/avaliacao";

interface AvaliacaoFormProps {
  nomeLoja: string;
  nota: number;
  onNotaChange: (nota: number) => void;
  comentario: string;
  onComentarioChange: (value: string) => void;
  status: SubmitStatus;
  errorMsg: string;
  onSubmit: () => void;
}

export default function AvaliacaoForm({
  nomeLoja,
  nota,
  onNotaChange,
  comentario,
  onComentarioChange,
  status,
  errorMsg,
  onSubmit,
}: AvaliacaoFormProps) {
  return (
    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 text-center bg-gradient-to-br from-novamix-orange to-novamix-orange-dk">
        <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">
          Novamix Food Service
        </p>
        <h1 className="text-novamix-teal text-2xl font-extrabold leading-tight font-poppins">
          Avalie nosso Atendimento
        </h1>
        <p className="text-white/90 text-sm font-bold mt-1">{nomeLoja}</p>
        <p className="text-white/65 text-xs mt-2">
          Sua opinião é muito importante para nós 🍴
        </p>
      </div>

      {/* Body */}
      <div className="px-8 py-7">
        <StarRating value={nota} onChange={onNotaChange} />

        <hr className="border-gray-100 my-4" />

        <TextAreaComentario value={comentario} onChange={onComentarioChange} />

        {status === "error" && <ErrorAlert message={errorMsg} />}

        <SubmitButton
          status={status}
          disabled={nota === 0 || status === "loading"}
          onClick={onSubmit}
        />
      </div>

      {/* Footer */}
      <div className="text-center pb-5">
        <p className="text-[10px] text-gray-300">
          © {new Date().getFullYear()} Novamix Food Service
        </p>
      </div>
    </div>
  );
}
