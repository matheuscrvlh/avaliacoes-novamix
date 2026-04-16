interface TextAreaComentarioProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export default function TextAreaComentario({
  value,
  onChange,
  maxLength = 500,
}: TextAreaComentarioProps) {
  return (
    <div>
      <label
        htmlFor="comentario"
        className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2"
      >
        Comentário{" "}
        <span className="normal-case font-normal">(opcional)</span>
      </label>

      <textarea
        id="comentario"
        rows={4}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Conte-nos como foi sua experiência com o nosso atendimento..."
        className="
          w-full resize-none rounded-xl border border-gray-200
          bg-novamix-cream px-4 py-3 text-sm text-gray-700
          placeholder-gray-400 leading-relaxed
          focus:outline-none focus:border-novamix-orange
          transition-colors duration-150
        "
        style={{ minHeight: "100px" }}
      />

      <p className="text-right text-[11px] text-gray-300 mt-1">
        {value.length}/{maxLength}
      </p>
    </div>
  );
}
