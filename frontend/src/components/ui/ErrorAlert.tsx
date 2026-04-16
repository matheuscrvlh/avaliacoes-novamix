interface ErrorAlertProps {
  message: string;
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-600 font-semibold">
      ⚠️ {message || "Não foi possível enviar. Tente novamente."}
    </div>
  );
}
