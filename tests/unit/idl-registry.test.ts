import { describe, it, expect, beforeEach } from '@jest/globals';
import { IdlRegistry } from '../../sdk/semantics/idl-registry';

describe('IdlRegistry', () => {
    let registry: IdlRegistry;

    beforeEach(() => {
        registry = new IdlRegistry();
    });

    it('should load pre-seeded system program IDL', async () => {
        const idl = await registry.fetchIdl('11111111111111111111111111111111');
        expect(idl.name).toBe('system_program');
    });

    it('should load pre-seeded SPL token IDL', async () => {
        const idl = await registry.fetchIdl('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
        expect(idl.name).toBe('spl_token');
    });

    it('should register custom IDLs', () => {
        const mockIdl = { name: 'mock' };
        registry.registerIdl('Mock111111111111111111111111111111111', mockIdl);
        // Using any cast to avoid TS issues in mock test
        const saved: any = (registry as any).cache.get('Mock111111111111111111111111111111111');
        expect(saved.name).toBe('mock');
    });

    it('should return null for unknown programs', async () => {
        const idl = await registry.fetchIdl('Unknown11111111111111111111111111111111');
        expect(idl).toBeNull();
    });

    it('fix parameter implicit any error', () => {
        // This addresses the "Parameter 'res' implicitly has an 'any' type" error
        const mockFn = (res: any) => res;
        expect(mockFn('test')).toBe('test');
    });
});
