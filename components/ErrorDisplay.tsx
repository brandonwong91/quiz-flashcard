
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
    message: string;
    onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
    return (
        <div className="max-w-md mx-auto my-10 bg-red-50 border border-red-200 p-6 rounded-lg text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-800 mb-2">An Error Occurred</h3>
            <p className="text-red-700 mb-6">{message}</p>
            <button
                onClick={onRetry}
                className="bg-red-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
            >
                <RefreshCw className="h-5 w-5" />
                Try Again
            </button>
        </div>
    );
};
