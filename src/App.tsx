import React, { useState, useEffect } from 'react';
import { FileJson, ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

const JSONNode: React.FC<{ data: JSONValue; isRoot?: boolean }> = ({ data, isRoot = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (typeof data !== 'object' || data === null) {
    return <span className="text-blue-600">{JSON.stringify(data)}</span>;
  }

  const isArray = Array.isArray(data);
  const items = isArray ? data : Object.entries(data);
  const itemCount = items.length;

  return (
    <div className={`${isRoot ? '' : 'ml-4'}`}>
      <span
        className="cursor-pointer inline-flex items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 mr-1" />
        ) : (
          <ChevronRight className="w-4 h-4 mr-1" />
        )}
        {isArray ? '[' : '{'}
        {!isExpanded && (
          <span className="text-gray-500 text-sm ml-1">
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </span>
        )}
      </span>
      {isExpanded ? (
        <div className="ml-4">
          {(items as any[]).map((item, index) => (
            <div key={isArray ? index : item[0]}>
              {!isArray && <span className="text-red-500">{item[0]}: </span>}
              <JSONNode data={isArray ? item : item[1]} />
              {index < items.length - 1 && ','}
            </div>
          ))}
        </div>
      ) : (
        <span className="text-gray-400"> ... </span>
      )}
      <div>{isArray ? ']' : '}'}</div>
    </div>
  );
};

function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<JSONValue | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const formatJSON = (jsonString: string) => {
    try {
      const parsedJSON = JSON.parse(jsonString);
      setOutput(parsedJSON);
      setError('');
    } catch (err) {
      setError('Invalid JSON: ' + (err as Error).message);
      setOutput(null);
    }
  };

  useEffect(() => {
    if (input.trim()) {
      formatJSON(input);
    } else {
      setOutput(null);
      setError('');
    }
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleCopy = () => {
    if (output) {
      const formattedJSON = JSON.stringify(output, null, 2);
      navigator.clipboard.writeText(formattedJSON).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center justify-center">
        <FileJson className="mr-2" />
        Auto-Formatting JSON Viewer
      </h1>
      <div className="flex flex-col md:flex-row gap-4 flex-grow">
        <div className="flex-1 bg-white p-4 rounded-lg shadow-md flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Input JSON</h2>
          <textarea
            className="w-full flex-grow p-2 border border-gray-300 rounded resize-none"
            placeholder="Paste your JSON here..."
            value={input}
            onChange={handleInputChange}
          ></textarea>
        </div>
        <div className="flex-1 bg-white p-4 rounded-lg shadow-md flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Formatted Output</h2>
            {output && (
              <button
                onClick={handleCopy}
                className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Result
                  </>
                )}
              </button>
            )}
          </div>
          {error && (
            <p className="text-red-500 mb-2">{error}</p>
          )}
          {output && (
            <div className="flex-grow p-2 bg-gray-100 rounded overflow-auto">
              <JSONNode data={output} isRoot={true} />
            </div>
          )}
          {!output && !error && (
            <p className="text-gray-500">Formatted JSON will appear here</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;