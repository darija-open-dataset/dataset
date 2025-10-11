import React from 'react';
import { Languages } from 'lucide-react';

function SentenceDisplay({ sentence }) {
  return (
    <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
      <div className="flex items-center gap-2 mb-6 text-gray-400">
        <Languages className="w-5 h-5" />
        <span className="text-sm font-medium">Line {sentence.lineNumber}</span>
      </div>

      <div className="space-y-6">
        {/* Darija - Latin Script */}
        {sentence.darija && (
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-2">
              Darija (Latin)
            </label>
            <p className="text-3xl font-semibold text-white leading-relaxed">
              {sentence.darija}
            </p>
          </div>
        )}

        {/* Darija - Arabic Script */}
        {sentence.darijaAr && (
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-2">
              الدارجة (عربي)
            </label>
            <p className="text-3xl font-semibold text-white leading-relaxed text-right" dir="rtl">
              {sentence.darijaAr}
            </p>
          </div>
        )}

        {/* English Translation (if available) */}
        {sentence.english && (
          <div className="pt-4 border-t border-gray-700">
            <label className="text-sm font-medium text-gray-400 block mb-2">
              English Translation
            </label>
            <p className="text-lg text-gray-300">
              {sentence.english}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SentenceDisplay;
