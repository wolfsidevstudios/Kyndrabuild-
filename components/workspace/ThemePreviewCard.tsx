
import React from 'react';

interface Theme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
}

interface ThemePreviewCardProps {
  theme: Theme;
  isSelected: boolean;
  onClick: () => void;
}

const ThemePreviewCard: React.FC<ThemePreviewCardProps> = ({ theme, isSelected, onClick }) => {
  const { primaryColor, secondaryColor } = theme;

  return (
    <div
      onClick={onClick}
      className={`rounded-xl overflow-hidden border-2 cursor-pointer transition-all transform hover:scale-105 ${
        isSelected ? 'ring-2 ring-gray-800 ring-offset-2 border-gray-800' : 'border-transparent hover:border-gray-300'
      }`}
    >
      <div className="p-2.5 bg-gray-100/80 aspect-[4/3]">
        <div className="grid grid-cols-3 gap-2 h-full">
          {/* Col 1 */}
          <div className="col-span-1 space-y-2 flex flex-col">
            {/* Total Revenue */}
            <div className="p-2 bg-white rounded-lg shadow-sm flex-1 flex flex-col justify-between">
              <div className="h-1 w-10 bg-gray-200 rounded-full"></div>
              <div className="h-2.5 w-14 bg-gray-700 rounded-full my-1"></div>
              <svg viewBox="0 0 50 15" className="w-full h-auto -ml-1">
                <path d="M 0 10 C 5 5, 10 12, 15 10, 20 8, 25 9, 30 10, 35 11, 40 8, 45 10, 50 12" stroke={primaryColor} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            {/* Upgrade */}
            <div className="p-2 bg-white rounded-lg shadow-sm flex-1 space-y-1.5">
              <div className="h-1 w-12 bg-gray-400 rounded-full"></div>
              <div className="h-1 w-full bg-gray-200 rounded-full"></div>
              <div className="flex gap-1.5 mt-2">
                <div className="h-3 flex-1 bg-gray-200/70 rounded"></div>
                <div className="h-3 flex-1 bg-gray-200/70 rounded"></div>
              </div>
              <div className="h-3 w-full bg-gray-200/70 rounded"></div>
            </div>
          </div>

          {/* Col 2 */}
          <div className="col-span-1 space-y-2 flex flex-col">
            {/* Calendar */}
            <div className="p-2 bg-white rounded-lg shadow-sm flex-1 space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                <div className="w-8 h-1.5 bg-gray-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
              </div>
              <div className="grid grid-cols-7 gap-1 px-1">
                {[...Array(21)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: [4, 6, 8, 12, 18].includes(i) ? primaryColor : ([5, 11].includes(i)) ? secondaryColor + '90' : '#E5E7EB' }}></div>
                ))}
              </div>
            </div>
            {/* Exercise Minutes */}
            <div className="p-2 bg-white rounded-lg shadow-sm flex-1">
               <div className="h-1 w-14 bg-gray-400 rounded-full mb-1"></div>
               <svg viewBox="0 0 50 20" className="w-full h-auto mt-2 -ml-1">
                <path d="M 0 18 C 10 15, 15 5, 25 2, 35 10, 40 12, 50 10" stroke={primaryColor} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Col 3 */}
          <div className="col-span-1 space-y-2 flex flex-col">
            {/* Move Goal */}
            <div className="p-2 bg-white rounded-lg shadow-sm flex-1 flex flex-col justify-between">
              <div className="h-1 w-10 bg-gray-400 rounded-full"></div>
              <div className="flex items-center justify-center my-1">
                <div className="w-8 h-3 bg-gray-700 rounded-full"></div>
              </div>
              <div className="flex items-end justify-between h-5 px-1">
                <div className="w-1.5 h-[70%] rounded-sm" style={{ backgroundColor: primaryColor }}></div>
                <div className="w-1.5 h-[50%] rounded-sm" style={{ backgroundColor: primaryColor }}></div>
                <div className="w-1.5 h-[80%] rounded-sm" style={{ backgroundColor: primaryColor }}></div>
                <div className="w-1.5 h-[40%] rounded-sm" style={{ backgroundColor: primaryColor }}></div>
                <div className="w-1.5 h-[60%] rounded-sm" style={{ backgroundColor: primaryColor }}></div>
                <div className="w-1.5 h-[90%] rounded-sm" style={{ backgroundColor: primaryColor }}></div>
              </div>
              <div className="h-3.5 w-full rounded-md mt-1.5" style={{ backgroundColor: secondaryColor }}></div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-2 bg-white">
        <p className="text-xs font-medium text-gray-800 truncate text-center">{theme.name}</p>
      </div>
    </div>
  );
};

export default ThemePreviewCard;
