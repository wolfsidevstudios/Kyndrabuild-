
import React from 'react';

const KEYWORDS = [
    'import', 'from', 'export', 'default', 'function', 'const', 'let', 'var', 'return', 'if', 
    'else', 'switch', 'case', 'break', 'type', 'interface', 'React', 'useState', 'useEffect',
    'useCallback', 'useMemo', 'useRef', 'new', 'async', 'await', 'try', 'catch', 'finally'
];
const JSX_TAGS = /<(\/?)(\w+)/g;
const STRINGS = /('.*?'|".*?"|`.*?`)/g;
const COMMENTS = /(\/\/.*|\/\*[\s\S]*?\*\/)/g;
const PROPS = /(\w+)=/g;
const PUNCTUATION = /([{}()[\],;:.])/g;

const TsxSyntaxHighlighter = ({ code }: { code: string }) => {
    // A simplified tokenizer. This is not a full parser.
    const parts = code.split(/(\/\/.*|\/\*[\s\S]*?\*\/|'.*?'|".*?"|`.*?`|<(?:\/?)(\w+)|(\w+)=|[{}()[\],;:.])/g).filter(part => part);

    return (
        <code>
            {parts.map((part, i) => {
                const key = `${i}-${part}`;
                if (part.startsWith('//') || part.startsWith('/*')) {
                    return <span key={key} className="text-gray-500">{part}</span>;
                }
                if (part.startsWith("'") || part.startsWith('"') || part.startsWith("`")) {
                    return <span key={key} className="text-green-400">{part}</span>;
                }
                if (KEYWORDS.includes(part)) {
                    return <span key={key} className="text-purple-400">{part}</span>;
                }
                if (part.match(/^<(\/?)(\w+)/)) { // JSX tags
                    return <span key={key} className="text-red-400">{part}</span>
                }
                if(part.endsWith('=')) { // props
                    return <span key={key} className="text-yellow-400">{part}</span>
                }
                if(PUNCTUATION.test(part)) {
                     return <span key={key} className="text-cyan-400">{part}</span>;
                }

                return <span key={key} className="text-gray-300">{part}</span>;
            })}
        </code>
    );
};

export default TsxSyntaxHighlighter;
