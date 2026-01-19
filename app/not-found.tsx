export default function NotFound() {
  return (
    <div className="section-container py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-6xl font-bold mb-4 text-slate-900">404</h1>
        <p className="text-xl text-slate-600 mb-8">
          Page not found
        </p>
        <a href="/" className="btn-primary">
          Go Home
        </a>
      </div>
    </div>
  );
}
