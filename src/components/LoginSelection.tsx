import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Plane, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LoginSelection = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-lg">
            <Plane className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">{t('app.title')}</h1>
          <p className="text-xl text-blue-200">{t('login.selectType')}</p>

          <button
            onClick={toggleLanguage}
            className="mt-6 inline-flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Globe className="h-5 w-5 mr-2" />
            {language === 'en' ? 'नेपाली' : 'English'}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div
            onClick={() => navigate('/login')}
            className="bg-white rounded-2xl shadow-2xl p-8 cursor-pointer transform transition-all hover:scale-105 hover:shadow-3xl"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('login.user')}</h2>
              <p className="text-gray-600 mb-6">
                {language === 'en'
                  ? 'Book flights, manage your bookings, and access your travel history.'
                  : 'उडान बुक गर्नुहोस्, आफ्नो बुकिङहरू व्यवस्थापन गर्नुहोस्, र आफ्नो यात्रा इतिहास पहुँच गर्नुहोस्।'
                }
              </p>
              <div className="space-y-3 text-left text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  {language === 'en' ? 'Search and book flights' : 'उडानहरू खोज्नुहोस् र बुक गर्नुहोस्'}
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  {language === 'en' ? 'View booking history' : 'बुकिङ इतिहास हेर्नुहोस्'}
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  {language === 'en' ? 'Manage your profile' : 'आफ्नो प्रोफाइल व्यवस्थापन गर्नुहोस्'}
                </div>
              </div>
              <button className="mt-8 w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                {t('login.signIn')}
              </button>
            </div>
          </div>

          <div
            onClick={() => navigate('/admin/login')}
            className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-2xl p-8 cursor-pointer transform transition-all hover:scale-105 hover:shadow-3xl border-2 border-blue-200"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('login.admin')}</h2>
              <p className="text-gray-600 mb-6">
                {language === 'en'
                  ? 'Manage system operations, users, flights, and view analytics.'
                  : 'प्रणाली सञ्चालन, प्रयोगकर्ताहरू, उडानहरू व्यवस्थापन गर्नुहोस् र विश्लेषण हेर्नुहोस्।'
                }
              </p>
              <div className="space-y-3 text-left text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  {language === 'en' ? 'Manage users and flights' : 'प्रयोगकर्ताहरू र उडानहरू व्यवस्थापन गर्नुहोस्'}
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  {language === 'en' ? 'View analytics and reports' : 'विश्लेषण र रिपोर्टहरू हेर्नुहोस्'}
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  {language === 'en' ? 'Configure system settings' : 'प्रणाली सेटिङहरू कन्फिगर गर्नुहोस्'}
                </div>
              </div>
              <button className="mt-8 w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-semibold">
                {t('login.signIn')}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-blue-200 text-sm">
          <p>
            {language === 'en'
              ? 'Need help? Contact us at '
              : 'मद्दत चाहिन्छ? हामीलाई सम्पर्क गर्नुहोस् '}
            <a href="mailto:info@nepalairlines.com" className="text-white hover:underline">
              info@nepalairlines.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSelection;
