export default function EmptyState({ mensaje }: { mensaje: string }) {
  return (
    <div className="text-center text-gray-500 py-20">
      <p className="text-lg">{mensaje}</p>
    </div>
  );
}
