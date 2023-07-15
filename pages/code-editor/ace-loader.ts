// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Ace } from 'ace-builds';
import { LanguageProvider } from 'ace-linters';
import { useEffect, useState } from 'react';
import { CodeEditorProps } from '~components';

export async function loadAce() {
  const ace = await import('ace-builds');
  ace.config.set('useStrictCSP', true);
  ace.config.set('useWorker', false);
  await import('ace-builds/esm-resolver');
  return ace;
}

export function setupLanguageProvider(editor: Ace.Editor) {
  const worker = new Worker(new URL('./ace-worker.js', import.meta.url));
  const languageProvider = LanguageProvider.create(worker);
  languageProvider.registerEditor(editor);
}

export function useAce() {
  const [ace, setAce] = useState<CodeEditorProps['ace']>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAce()
      .then(ace => setAce(ace))
      .finally(() => setLoading(false));
  }, []);
  return { ace, loading };
}
