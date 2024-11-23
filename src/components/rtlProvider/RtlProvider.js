import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

// NB: A unique `key` is important for it to work!
const options = {
  rtl: { key: 'css-ar' }, // Removido `stylisPlugins` relacionado ao rtl
  ltr: { key: 'css-en' },
};

export function RtlProvider({ children }) {
  // Verifica a direção do documento (se é 'rtl' ou 'ltr')
  const dir = document.documentElement.dir === 'ar' ? 'rtl' : 'ltr';
  
  // Cria o cache com base na direção atual
  const cache = createCache(options[dir]);

  // Renderiza o `CacheProvider` com o valor do cache e os filhos
  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
