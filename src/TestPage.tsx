export default function TestPage() {
  return (
    <div className="m-12 bg-red-100 p-6 rounded">
      <h1 className="text-3xl font-bold text-red-700">Test: CSS is working!</h1>
      <p className="text-red-600">If you see this with red background and red text, Tailwind CSS is loaded.</p>
      <div className="mt-4 bg-blue-100 p-4 rounded text-blue-700">
        <p>Test 2: Blue background = CSS working</p>
      </div>
    </div>
  )
}
