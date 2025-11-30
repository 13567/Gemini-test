import React from 'react';

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  resultImage: string | null;
}

export interface PresetPrompt {
  id: string;
  label: string;
  prompt: string;
  icon: React.ReactNode;
}