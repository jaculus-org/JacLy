import { Link } from '@tanstack/react-router';

export function NotFoundPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">404</h1>
      <p className="mt-2 opacity-80">This page doesn't exist.</p>
      <div className="mt-4">
        <Link to="/" className="underline">
          Home
        </Link>
        <span className="mx-2">•</span>
        {/* <Link to="/editor" className="underline">Projects</Link> */}
      </div>
    </div>
  );
}
