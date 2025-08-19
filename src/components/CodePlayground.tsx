import { useState } from 'react';

interface CodePlaygroundProps {
  initialCode?: string;
  language?: string;
}

export default function CodePlayground({ 
  initialCode = '// Type your code here\nconsole.log("Hello, World!");',
  language = 'javascript' 
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');

  const runCode = () => {
    try {
      // Create a custom console.log that captures output
      const logs: string[] = [];
      const customConsole = {
        log: (...args: any[]) => {
          logs.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '));
        }
      };

      // Create a function with the code and run it
      const func = new Function('console', code);
      func(customConsole);
      
      setOutput(logs.join('\n') || 'Code executed successfully (no output)');
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="code-playground my-6 border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex justify-between items-center">
        <span className="font-mono text-sm text-gray-600">Code Playground ({language})</span>
        <button
          onClick={runCode}
          className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
        >
          ▶ Run
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-300">
        <div className="p-4">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-40 p-2 font-mono text-sm border border-gray-200 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your code here..."
            spellCheck={false}
          />
        </div>
        <div className="p-4 bg-gray-50">
          <div className="font-mono text-sm">
            <div className="text-gray-500 mb-2">Output:</div>
            <pre className="whitespace-pre-wrap text-gray-800">{output || 'Click "Run" to see output'}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}