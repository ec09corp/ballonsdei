import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { StoreSettings } from '../types/database';
import { INITIAL_SETTINGS } from '../lib/mockData';

const LOCAL_SETTINGS_KEY = 'ballonsdei_settings_cache';

function getLocalSettings(): StoreSettings {
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Auto-upgrade if using old svg placeholder or old uppercase name
      if (parsed.logo_url === '/logo/logo.svg') {
        parsed.logo_url = '/logo/logo.jpg';
      }
      if (!parsed.phone || parsed.phone.includes('0000-0000')) {
        parsed.phone = '+507 6432-4750';
      }
      if (!parsed.whatsapp_number || parsed.whatsapp_number.includes('0000-0000')) {
        parsed.whatsapp_number = '+507 6432-4750';
      }
      if (
        !parsed.google_maps_url ||
        parsed.google_maps_url.includes('boutique+ballonsdei') ||
        parsed.google_maps_url.includes('maps.google.com/?q=ballonsdei') ||
        parsed.google_maps_url.includes('3kyhrTZrjEUyy8e9') ||
        parsed.google_maps_url.includes('3kyhrTZrj')
      ) {
        parsed.google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Ballonsdei+Panama';
      }
      return {
        ...INITIAL_SETTINGS,
        ...parsed,
      };
    }
  } catch (e) {}
  return INITIAL_SETTINGS;
}

function saveLocalSettings(settings: StoreSettings) {
  try {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {}
}

export const settingsService = {
  async getSettings(): Promise<StoreSettings> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .limit(1)
          .single();

        if (!error && data) {
          return {
            ...INITIAL_SETTINGS,
            ...data,
          };
        }
      } catch (err) {
        console.warn('Error fetching settings from Supabase, using local:', err);
      }
    }

    return getLocalSettings();
  },

  async updateSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    if (supabase && isSupabaseConfigured) {
      try {
        // Check if row exists
        const { data: existing } = await supabase.from('settings').select('id').limit(1);

        if (existing && existing.length > 0) {
          const { data, error } = await supabase
            .from('settings')
            .update(settings)
            .eq('id', existing[0].id)
            .select()
            .single();

          if (!error && data) return data;
        } else {
          const { data, error } = await supabase
            .from('settings')
            .insert({ ...INITIAL_SETTINGS, ...settings })
            .select()
            .single();

          if (!error && data) return data;
        }
      } catch (err) {
        console.error('Error updating settings in Supabase:', err);
      }
    }

    const current = getLocalSettings();
    const updated = { ...current, ...settings };
    saveLocalSettings(updated);
    return updated;
  },
};
