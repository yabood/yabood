import { useState } from 'react';

interface CounterProps {
  initialValue?: number;
  step?: number;
}

export default function Counter({ initialValue = 0, step = 1 }: CounterProps) {
  const [count, setCount] = useState(initialValue);

  return (
    <div className="inline-flex items-center gap-3 p-4 bg-gray-100 rounded-lg my-4">
      <button
        onClick={() => setCount(count - step)}
        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        aria-label="Decrease count">
        -
      </button>
      <span className="font-mono text-xl min-w-[3ch] text-center">{count}</span>
      <button
        onClick={() => setCount(count + step)}
        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        aria-label="Increase count">
        +
      </button>
      <button
        onClick={() => setCount(initialValue)}
        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors ml-2"
        aria-label="Reset count">
        Reset
      </button>
    </div>
  );
}
