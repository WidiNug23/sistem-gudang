"use client" // Ini wajib untuk menggunakan onClick / confirm

type Props = {
  id: number;
  action: (id: number) => Promise<void>;
  label: string;
  confirmMsg: string;
  className?: string;
}

export default function DeleteButton({ id, action, label, confirmMsg, className }: Props) {
  const handleAction = async () => {
    if (window.confirm(confirmMsg)) {
      await action(id);
    }
  };

  return (
    <button onClick={handleAction} className={className}>
      {label}
    </button>
  );
}