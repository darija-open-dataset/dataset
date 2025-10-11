import React from 'react';
import { ArrowLeft, FileText, CheckCircle, Circle } from 'lucide-react';

function Header({ fileName, stats, onBack }) {
  const progress = stats.total > 0 ? (stats.annotated / stats.total) * 100 : 0;

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="h-8 w-px bg-gray-700" />
          
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-400" />
            <span className="font-medium">{fileName}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2 text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>{stats.annotated} / {stats.total} sentences with audio</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Circle className="w-4 h-4 text-blue-400" />
              <span>{stats.byUser} recorded by you</span>
            </div>
          </div>

          <div className="w-48">
            <div className="text-xs text-gray-400 mb-1">Overall Progress</div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1 text-right">{progress.toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
