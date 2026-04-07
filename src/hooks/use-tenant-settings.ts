'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getCurrentTenantAction } from '@/features/auth/actions/get-tenant';
import type { Tenant, TenantConfig } from '@/types/appwrite';
import { toast } from 'sonner';

interface TenantSettingsState {
  tenant: Tenant | null;
  config: TenantConfig;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

/**
 * Hook that loads the current tenant + parsed config and provides a `save`
 * function that PATCHes only the supplied config fields.
 *
 * Usage:
 * ```ts
 * const { config, loading, saving, save } = useTenantSettings();
 * // read: config.aiEnabled
 * // write: save({ aiEnabled: true, model: 'gpt-4o' })
 * ```
 */
export function useTenantSettings() {
  const [state, setState] = useState<TenantSettingsState>({
    tenant: null,
    config: {},
    loading: true,
    saving: false,
    error: null
  });

  // Keep a ref to the latest config so save() always merges correctly
  const configRef = useRef<TenantConfig>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await getCurrentTenantAction();
        if (cancelled) return;

        if (result.tenant) {
          let parsed: TenantConfig = {};
          try {
            parsed =
              typeof result.tenant.config === 'string'
                ? JSON.parse(result.tenant.config)
                : (result.tenant.config as TenantConfig);
          } catch {
            parsed = {};
          }
          configRef.current = parsed;
          setState({
            tenant: result.tenant,
            config: parsed,
            loading: false,
            saving: false,
            error: null
          });
        } else {
          setState({
            tenant: null,
            config: {},
            loading: false,
            saving: false,
            error: result.error ?? 'No tenant found'
          });
        }
      } catch (err) {
        if (cancelled) return;
        setState({
          tenant: null,
          config: {},
          loading: false,
          saving: false,
          error: err instanceof Error ? err.message : 'Failed to load tenant'
        });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Persist partial config updates via PATCH /api/tenant/settings.
   * Merges the supplied fields into the existing config.
   */
  const save = useCallback(
    async (
      updates: Partial<TenantConfig> & {
        name?: string;
        subdomain?: string;
      },
      successMessage = 'Settings saved'
    ) => {
      setState((prev) => ({ ...prev, saving: true }));
      try {
        const res = await fetch('/api/tenant/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error ?? `Failed to save settings (${res.status})`
          );
        }

        const data = await res.json();

        // Merge response config back into local state
        const newConfig = data.config
          ? { ...configRef.current, ...data.config }
          : { ...configRef.current, ...updates };

        configRef.current = newConfig;
        setState((prev) => ({
          ...prev,
          config: newConfig,
          saving: false,
          tenant: prev.tenant
            ? {
                ...prev.tenant,
                name: data.name ?? prev.tenant.name,
                subdomain: data.subdomain ?? prev.tenant.subdomain
              }
            : prev.tenant
        }));

        toast.success(successMessage);
      } catch (err) {
        setState((prev) => ({ ...prev, saving: false }));
        toast.error(
          err instanceof Error ? err.message : 'Failed to save settings'
        );
      }
    },
    []
  );

  return {
    tenant: state.tenant,
    config: state.config,
    loading: state.loading,
    saving: state.saving,
    error: state.error,
    save
  };
}
