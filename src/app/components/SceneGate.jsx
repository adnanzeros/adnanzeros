'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Scene3D from './Scene3D';

/* Je route gulote 3D scene lagbe na */
const NO_SCENE = ['/cv'];

export default function SceneGate() {
  const pathname = usePathname() || '';
  const hide = NO_SCENE.some(
    p => pathname === p || pathname.startsWith(p + '/'),
  );

  /* CSS e use korar jonno html e class boshiye dey */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('no-scene', hide);
    return () => root.classList.remove('no-scene');
  }, [hide]);

  return hide ? null : <Scene3D />;
}
