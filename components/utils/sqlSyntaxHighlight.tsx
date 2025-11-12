import React from 'react';

const KEYWORDS = [
    'CREATE', 'TABLE', 'PRIMARY', 'KEY', 'TEXT', 'BOOLEAN', 'TIMESTAMP', 
    'WITH', 'TIME', 'ZONE', 'DEFAULT', 'SELECT', 'FROM', 'WHERE', 'INSERT', 
    'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'NOT', 'NULL', 'BIGINT', 
    'GENERATED', 'BY', 'AS', 'IDENTITY'
];
const FUNCTIONS = ['now()'];
const TYPES = ['text', 'boolean', 'timestamp', 'bigint', 'timestamptz'];
const COMMENTS = /(--.*)/g;

const SqlSyntaxHighlighter = ({ code }: { code: string }) => {
    // Split by comments first to treat them as whole tokens
    const parts = code.split(COMMENTS).filter(part => part);
    
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('--')) {
                    return <span key={i} className="text-gray-400">{part}</span>;
                }

                // Tokenize the non-comment parts
                return part.split(/([ \n\t\(\),;=])/g).map((token, j) => {
                    const key = `${i}-${j}`;
                    if (KEYWORDS.includes(token.toUpperCase())) {
                        return <span key={key} className="text-purple-400 font-semibold">{token}</span>;
                    }
                    if (TYPES.includes(token.toLowerCase())) {
                        return <span key={key} className="text-teal-300">{token}</span>;
                    }
                    if (FUNCTIONS.includes(token.toLowerCase())) {
                        return <span key={key} className="text-yellow-400">{token}</span>;
                    }
                    if (token.startsWith("'") && token.endsWith("'")) {
                        return <span key={key} className="text-green-400">{token}</span>;
                    }
                    // For numbers or other values
                    if (!isNaN(parseFloat(token))) {
                        return <span key={key} className="text-orange-400">{token}</span>
                    }
                    return <span key={key}>{token}</span>;
                });
            })}
        </>
    );
};

export default SqlSyntaxHighlighter;
