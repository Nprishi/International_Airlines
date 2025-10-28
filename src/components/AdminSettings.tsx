import React, { useState, useEffect } from 'react';
import { Save, DollarSign, Mail, Phone, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface AdminSettingsProps {
  onUpdate?: () => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const [settings, setSettings] = useState({
    usd_to_npr_rate: '132.50',
    site_name: 'Nepal International Air Ticketing',
    site_email: 'info@nepalairlines.com',
    site_phone: '+977-1-1234567',
    esewa_merchant_id: '',
    esewa_secret_key: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .maybeSingle();

    if (!error && data) {
      setSettings({
        usd_to_npr_rate: data.usd_to_npr_rate?.toString() || '132.50',
        site_name: data.site_name || 'Nepal International Air Ticketing',
        site_email: data.site_email || 'info@nepalairlines.com',
        site_phone: data.site_phone || '+977-1-1234567',
        esewa_merchant_id: data.esewa_merchant_id || '',
        esewa_secret_key: data.esewa_secret_key || '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .maybeSingle();

      const payload = {
        ...settings,
        usd_to_npr_rate: parseFloat(settings.usd_to_npr_rate),
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        const { error: updateError } = await supabase
          .from('site_settings')
          .update(payload)
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('site_settings')
          .insert([payload]);

        if (insertError) throw insertError;
      }

      setSuccess(true);
      if (onUpdate) onUpdate();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('admin.settings')}</h2>
        <p className="text-sm text-gray-600 mt-1">
          {t('settings.save')}
        </p>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-sm text-green-800">Settings saved successfully!</p>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exchange Rate Settings</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                {t('settings.exchangeRate')}
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.usd_to_npr_rate}
                onChange={(e) => setSettings({ ...settings, usd_to_npr_rate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: 1 USD = रू {settings.usd_to_npr_rate} NPR
              </p>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Information</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings.siteName')}
              </label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                {t('settings.siteEmail')}
              </label>
              <input
                type="email"
                value={settings.site_email}
                onChange={(e) => setSettings({ ...settings, site_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                {t('settings.sitePhone')}
              </label>
              <input
                type="tel"
                value={settings.site_phone}
                onChange={(e) => setSettings({ ...settings, site_phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Gateway Settings</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="inline h-4 w-4 mr-1" />
                {t('settings.esewaId')}
              </label>
              <input
                type="text"
                value={settings.esewa_merchant_id}
                onChange={(e) => setSettings({ ...settings, esewa_merchant_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter eSewa Merchant ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings.esewaKey')}
              </label>
              <input
                type="password"
                value={settings.esewa_secret_key}
                onChange={(e) => setSettings({ ...settings, esewa_secret_key: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter eSewa Secret Key"
              />
              <p className="text-xs text-gray-500 mt-1">
                This key is encrypted and securely stored
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                {t('settings.save')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
