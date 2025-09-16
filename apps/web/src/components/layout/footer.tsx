export function Footer() {
  return (
    <footer>
      <div className="w-full border-t border-gray-200 bg-white/50 px-4 py-2 text-center text-sm text-gray-500 backdrop-blur-sm">
        &copy; {new Date().getFullYear()} Jaculus. All rights reserved.
      </div>
    </footer>
  );
}
