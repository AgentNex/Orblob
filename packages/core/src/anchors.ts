import { Vector2 } from './math';

export interface AnchorPoint {
  x: number; // 0..1
  y: number; // 0..1
  visible: boolean;
}

export interface AnchorManager {
  updateMarkers(
    markers: Array<{ id: string; location: [number, number] }>,
    projectFn: (loc: [number, number]) => AnchorPoint
  ): void;
  updateArcs(
    arcs: Array<{ id: string; from: [number, number]; to: [number, number] }>,
    projectFn: (arc: { from: [number, number]; to: [number, number] }) => AnchorPoint | null
  ): void;
  sync(): void;
  destroy(): void;
}

export function createAnchorManager(container: HTMLElement): AnchorManager {
  const markerElements: Record<string, HTMLElement> = {};
  const arcElements: Record<string, HTMLElement> = {};
  const cssVars: Record<string, string> = {};

  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-orblob-anchors', 'true');
  document.head.appendChild(styleEl);

  function createOrUpdateAnchor(
    collection: Record<string, HTMLElement>,
    id: string,
    prefix: string,
    pos: AnchorPoint
  ) {
    let el = collection[id];
    if (!el) {
      el = document.createElement('div');
      el.style.cssText = `position:absolute;width:1px;height:1px;pointer-events:none;anchor-name:${prefix}${id};`;
      container.appendChild(el);
      collection[id] = el;
    }

    el.style.left = `${(pos.x * 100).toFixed(3)}%`;
    el.style.top = `${(pos.y * 100).toFixed(3)}%`;

    if (pos.visible) {
      cssVars[`${prefix}visible-${id}`] = '1';
    } else {
      delete cssVars[`${prefix}visible-${id}`];
    }
  }

  return {
    updateMarkers(markers, projectFn) {
      const activeIds: Record<string, boolean> = {};

      for (const m of markers) {
        if (!m.id) continue;
        activeIds[m.id] = true;
        const pos = projectFn(m.location);
        createOrUpdateAnchor(markerElements, m.id, '--orblob-', pos);
      }

      for (const id in markerElements) {
        if (!activeIds[id]) {
          markerElements[id].remove();
          delete markerElements[id];
          delete cssVars[`--orblob-visible-${id}`];
        }
      }
    },

    updateArcs(arcs, projectFn) {
      const activeIds: Record<string, boolean> = {};

      for (const a of arcs) {
        if (!a.id) continue;
        activeIds[a.id] = true;
        const pos = projectFn(a);
        if (pos) {
          createOrUpdateAnchor(arcElements, a.id, '--orblob-arc-', pos);
        }
      }

      for (const id in arcElements) {
        if (!activeIds[id]) {
          arcElements[id].remove();
          delete arcElements[id];
          delete cssVars[`--orblob-visible-arc-${id}`];
        }
      }
    },

    sync() {
      let cssRules = ':root {\n';
      for (const key in cssVars) {
        cssRules += `  ${key}: ${cssVars[key]};\n`;
      }
      cssRules += '}';
      styleEl.textContent = cssRules;
    },

    destroy() {
      for (const id in markerElements) {
        markerElements[id].remove();
      }
      for (const id in arcElements) {
        arcElements[id].remove();
      }
      styleEl.remove();
    },
  };
}
