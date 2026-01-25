// Export all public types
export * from './types';

// Export privacy engine (core scanning & remediation detection)
export { PrivacyEngine } from './privacy-engine';
export { PrivacyPipeline } from './pipeline';

// Export Privacy Core (Production)
export { PrivacyShield } from './privacy/shield';
export { PrivacyRelayer } from './privacy/relayer';

// Export client (main entry point)
export { SolVoidClient, SolVoidConfig } from './client';

// Export registry utilities (needed for decoding for the pipeline)
export { OnChainIdlFetcher } from './registry/idl-fetcher';
export { KNOWN_PROGRAMS, identifyProgram, isSwapProgram } from './registry/programs';

// Export configuration utilities
export { ConfigLoader, EnvConfig } from './utils/config';
