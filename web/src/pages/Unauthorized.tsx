export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-2">Acceso denegado</h1>
      <p className="text-gray-600 mb-4">
        No tienes permisos para acceder a esta sección.
      </p>
      <a href="/" className="text-blue-600 underline">
        Volver al inicio
      </a>
    </div>
  )
}
