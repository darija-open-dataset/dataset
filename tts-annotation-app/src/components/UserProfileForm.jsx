import React, { useState } from 'react';
import { User, MapPin, Calendar, UserCircle } from 'lucide-react';

const MOROCCAN_REGIONS = [
  'Tanger-Tétouan-Al Hoceïma',
  'L\'Oriental',
  'Fès-Meknès',
  'Rabat-Salé-Kénitra',
  'Béni Mellal-Khénifra',
  'Casablanca-Settat',
  'Marrakech-Safi',
  'Drâa-Tafilalet',
  'Souss-Massa',
  'Guelmim-Oued Noun',
  'Laâyoune-Sakia El Hamra',
  'Dakhla-Oued Ed-Dahab',
];

function UserProfileForm({ userId, existingProfile, onSave, onSkip }) {
  const [formData, setFormData] = useState({
    gender: existingProfile?.gender || '',
    ageRange: existingProfile?.ageRange || '',
    region: existingProfile?.region || '',
    nativeRegion: existingProfile?.nativeRegion || '',
    dialect: existingProfile?.dialect || '',
    ...existingProfile,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.gender) newErrors.gender = 'Please select your gender';
    if (!formData.ageRange) newErrors.ageRange = 'Please select your age range';
    if (!formData.region) newErrors.region = 'Please select your current region';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(formData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Annotator Profile
          </h1>
          <p className="text-gray-400 text-lg">
            Help us build a diverse TTS dataset by sharing some information about yourself
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
            <User className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Your ID: <span className="font-mono text-white">{userId}</span></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <div className="space-y-6">
            {/* Gender */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                <UserCircle className="w-4 h-4" />
                Gender <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['Male', 'Female'].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleChange('gender', option)}
                    className={`p-3 rounded-lg border transition-all ${
                      formData.gender === option
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender}</p>}
            </div>

            {/* Age Range */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                <Calendar className="w-4 h-4" />
                Age Range <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['18-25', '26-35', '36-45', '46-55', '56-65', '65+'].map(range => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => handleChange('ageRange', range)}
                    className={`p-3 rounded-lg border transition-all ${
                      formData.ageRange === range
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              {errors.ageRange && <p className="text-red-400 text-sm mt-1">{errors.ageRange}</p>}
            </div>

            {/* Current Region */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                <MapPin className="w-4 h-4" />
                Current Region in Morocco <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.region}
                onChange={(e) => handleChange('region', e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select your current region</option>
                {MOROCCAN_REGIONS.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              {errors.region && <p className="text-red-400 text-sm mt-1">{errors.region}</p>}
            </div>

            {/* Native Region (Optional) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                <MapPin className="w-4 h-4" />
                Native/Origin Region <span className="text-gray-500">(Optional)</span>
              </label>
              <select
                value={formData.nativeRegion}
                onChange={(e) => handleChange('nativeRegion', e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select your native region (if different)</option>
                {MOROCCAN_REGIONS.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select if you grew up in a different region than where you currently live
              </p>
            </div>

            {/* Dialect Notes (Optional) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                Dialect Characteristics <span className="text-gray-500">(Optional)</span>
              </label>
              <textarea
                value={formData.dialect}
                onChange={(e) => handleChange('dialect', e.target.value)}
                placeholder="E.g., Northern dialect, Casablanca accent, mix of Fes and Rabat..."
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
              />
              <p className="text-xs text-gray-500 mt-1">
                Any additional notes about your Darija dialect or accent
              </p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-gray-300">Privacy:</strong> This information is used solely for dataset diversity tracking
              and will be stored anonymously with your recordings. Your personal identity remains protected through your User ID.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg"
            >
              {existingProfile ? 'Update Profile' : 'Save & Continue'}
            </button>
            {!existingProfile && onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
              >
                Skip for Now
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserProfileForm;
