/**
 * Speech (ASR + TTS) — Bhashini / AI4Bharat primary, Sarvam fallback.
 * v1 launch languages: English + Hindi only (per architecture decision 2026-05-24).
 * Per-language quality eval (MOS + WER) must pass before adding ramp languages.
 */

import type { Language, Result } from '@aura/core';

export interface AsrInput {
  audio: Uint8Array; // 16kHz PCM is sufficient for speech recognition
  language: Language;
}

export interface AsrResult {
  text: string;
  confidence: number;
  durationMs: number;
}

export interface TtsInput {
  text: string;
  language: Language;
}

export interface TtsResult {
  audio: Uint8Array;
  format: 'mp3' | 'wav';
}

/** Bhashini ASR. Stub — feature bet wires the API client. */
export async function asr(_input: AsrInput): Promise<Result<AsrResult>> {
  return {
    ok: false,
    error: new Error('TODO: wire Bhashini ASR client (with Sarvam fallback) — feature bet'),
  };
}

/** Bhashini TTS. */
export async function tts(_input: TtsInput): Promise<Result<TtsResult>> {
  return {
    ok: false,
    error: new Error('TODO: wire Bhashini TTS client (with Sarvam fallback) — feature bet'),
  };
}
