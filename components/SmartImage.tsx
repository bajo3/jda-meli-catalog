// components/SmartImage.tsx
'use client';

import Image, { type ImageProps } from 'next/image';
import { isMeliImage, meliImage, type MeliVariant } from '@/lib/meliImage';

type Props = Omit<ImageProps, 'src'> & {
  src: string;
  /**
   * Tamanio a pedirle al CDN de Mercado Libre.
   * Solo aplica cuando el src es de mlstatic.
   */
  variant?: MeliVariant;
};

/**
 * Drop-in replacement de next/image.
 *
 * - src de mlstatic  -> reescribe al sufijo de tamanio correcto y setea
 *                       `unoptimized` (no consume cuota de Image Optimization).
 * - src local        -> pasa por el optimizador de Next como siempre.
 *
 * Ademas fuerza un `sizes` por defecto cuando se usa `fill` sin declararlo,
 * porque Next en ese caso genera el srcset completo (todos los deviceSizes),
 * que es la causa principal de consumo de cuota.
 */
export default function SmartImage({ src, variant = 'full', sizes, fill, ...rest }: Props) {
  const remote = isMeliImage(src);
  const publicStorage = /^https:\/\/[^/]*\.supabase\.co\/storage\/v1\/object\/public\//i.test(src);
  const finalSrc = remote ? meliImage(src, variant) : src;

  // Guard: `fill` sin `sizes` -> Next genera todos los anchos.
  const finalSizes = fill ? sizes ?? '100vw' : sizes;

  return (
    <Image
      {...rest}
      src={finalSrc}
      fill={fill}
      sizes={finalSizes}
      unoptimized={remote || publicStorage || rest.unoptimized}
    />
  );
}
