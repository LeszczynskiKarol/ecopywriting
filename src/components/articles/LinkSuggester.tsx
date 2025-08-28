// src/components/articles/LinkSuggester.tsx
import React, { useState, useEffect } from 'react';
import type { ReactQuillType } from '@/types/editor';

interface LinkSuggestion {
    articleId: string;
    title: string;
    slug: string;
    categorySlug: string;
    relevance: number;
    suggestedContext: string[];
}

interface LinkSuggesterProps {
    content: string;
    quillRef: React.RefObject<ReactQuillType>;
}


const LinkSuggester: React.FC<LinkSuggesterProps> = ({ content, quillRef }) => {
    const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (content && content.length > 200) {
            const debounceTimer = setTimeout(() => {
                generateSuggestions();
            }, 1000);

            return () => clearTimeout(debounceTimer);
        }
    }, [content]);

    const generateSuggestions = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            // Używamy właściwego endpointu
            const response = await fetch('/api/linkRoutes/suggest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text: content }),
            });

            if (response.ok) {
                const data = await response.json();
                setSuggestions(data.data);
            }
        } catch (error) {
            console.error('Błąd podczas generowania sugestii:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: LinkSuggestion) => {
        const quillEditor = quillRef.current?.getEditor();
        if (!quillEditor) return;

        const text = quillEditor.getText();
        const title = suggestion.title;
        const link = `/articles/${suggestion.categorySlug}/${suggestion.slug}`;

        let searchIndex = 0;
        while (true) {
            const index = text.indexOf(title, searchIndex);
            if (index === -1) break;

            const format = quillEditor.getFormat(index);
            quillEditor.deleteText(index, title.length);
            quillEditor.insertText(index, title, {
                ...format,
                link: link
            });

            searchIndex = index + title.length;
        }
    };


    return (
        <div className="mt-4 bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">
                Sugerowane linki
                <button
                    onClick={generateSuggestions}
                    className="ml-2 px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                    Odśwież
                </button>
            </h3>

            {isLoading ? (
                <div className="flex justify-center py-4">
                    <div className="loader" />
                </div>
            ) : suggestions.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                        <div
                            key={suggestion.articleId}
                            className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">{suggestion.title}</h4>
                                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {Math.round(suggestion.relevance * 100)}%
                                </span>
                            </div>
                            <div className="text-sm text-gray-600">
                                {suggestion.suggestedContext.map((context, index) => (
                                    <p key={index} className="mt-1">
                                        {context}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center py-4">
                    Nie znaleziono sugestii linków dla tego tekstu
                </p>
            )}
        </div>
    );
};

export default LinkSuggester;  