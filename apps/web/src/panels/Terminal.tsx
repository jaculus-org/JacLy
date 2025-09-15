export function Terminal() {
  return (
    <div className="h-full w-full">
      <h2 className="p-2">Terminal Panel</h2>
      <div className="m-2 rounded border border-gray-300 bg-blue-800 p-2 text-green-500">
        <p>$ echo "Hello, Terminal!"</p>
        <p>Hello, Terminal!</p>
        <p>$ ls -la</p>
      </div>
    </div>
  );
}
