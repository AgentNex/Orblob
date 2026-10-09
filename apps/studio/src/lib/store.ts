import { create } from 'zustand';
import {
  SceneConfig,
  createDefaultScene,
  PRESETS,
  MarkerConfig,
  ArcConfig,
  LabelConfig,
  GlobeAppearance,
  GlobeTransform,
  AtmosphereConfig,
} from '@orblob/config';
import {
  CloudProjectRecord,
  getCurrentUser,
  saveCloudProject,
  fetchUserProjects,
} from './insforge';

export type StudioMode = 'studio' | 'code' | 'preview' | 'export';
export type DevicePreview = 'desktop' | 'tablet' | 'mobile';
export type ThemeMode = 'light' | 'dark';

export interface StudioState {
  // Scene Config & State
  scene: SceneConfig;
  history: SceneConfig[];
  future: SceneConfig[];

  // Selection
  activeLayerId: string | null;
  activeMarkerId: string | null;
  activeArcId: string | null;
  activeLabelId: string | null;

  // View / UI
  studioMode: StudioMode;
  devicePreview: DevicePreview;
  theme: ThemeMode;
  isAuthModalOpen: boolean;
  isExportModalOpen: boolean;
  isProjectsDrawerOpen: boolean;
  isCommandPaletteOpen: boolean;

  // Cloud & Project
  currentProjectId: string | null;
  currentProjectName: string;
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error';
  saveErrorMessage: string | null;
  currentUser: any;
  userProjects: CloudProjectRecord[];

  // Actions
  setScene: (scene: SceneConfig, pushHistory?: boolean) => void;
  updateAppearance: (partial: Partial<GlobeAppearance>) => void;
  updateTransform: (partial: Partial<GlobeTransform>) => void;
  updateAtmosphere: (partial: Partial<AtmosphereConfig>) => void;

  addMarker: (marker: MarkerConfig) => void;
  updateMarker: (id: string, partial: Partial<MarkerConfig>) => void;
  deleteMarker: (id: string) => void;

  addArc: (arc: ArcConfig) => void;
  updateArc: (id: string, partial: Partial<ArcConfig>) => void;
  deleteArc: (id: string) => void;

  addLabel: (label: LabelConfig) => void;
  updateLabel: (id: string, partial: Partial<LabelConfig>) => void;
  deleteLabel: (id: string) => void;

  applyPreset: (presetId: string) => void;
  undo: () => void;
  redo: () => void;

  setActiveLayer: (id: string | null) => void;
  setActiveMarker: (id: string | null) => void;
  setActiveArc: (id: string | null) => void;
  setActiveLabel: (id: string | null) => void;

  setStudioMode: (mode: StudioMode) => void;
  setDevicePreview: (device: DevicePreview) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  setAuthModalOpen: (open: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  setProjectsDrawerOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;

  setProjectName: (name: string) => void;
  saveCurrentProject: () => Promise<void>;
  loadProject: (project: CloudProjectRecord) => void;
  loadProjectsList: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  newBlankProject: () => void;
}

let autosaveTimer: any = null;

export const useStudioStore = create<StudioState>((set, get) => ({
  scene: createDefaultScene(),
  history: [],
  future: [],

  activeLayerId: 'layer-globe',
  activeMarkerId: null,
  activeArcId: null,
  activeLabelId: null,

  studioMode: 'studio',
  devicePreview: 'desktop',
  theme: 'light',
  isAuthModalOpen: false,
  isExportModalOpen: false,
  isProjectsDrawerOpen: false,
  isCommandPaletteOpen: false,

  currentProjectId: null,
  currentProjectName: 'Untitled Globe',
  saveStatus: 'saved',
  saveErrorMessage: null,
  currentUser: null,
  userProjects: [],

  setScene: (scene, pushHistory = true) => {
    const current = get().scene;
    const history = pushHistory ? [...get().history.slice(-25), current] : get().history;
    set({ scene, history, future: [], saveStatus: 'unsaved' });

    // Local storage persistence
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('orblob_local_draft', JSON.stringify(scene));
      } catch (e) {}
    }

    // Debounced autosave
    if (get().currentProjectId && get().currentUser) {
      if (autosaveTimer) clearTimeout(autosaveTimer);
      autosaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 2500);
    }
  },

  updateAppearance: (partial) => {
    const scene = { ...get().scene, appearance: { ...get().scene.appearance, ...partial } };
    get().setScene(scene);
  },

  updateTransform: (partial) => {
    const scene = { ...get().scene, transform: { ...get().scene.transform, ...partial } };
    get().setScene(scene);
  },

  updateAtmosphere: (partial) => {
    const scene = { ...get().scene, atmosphere: { ...get().scene.atmosphere, ...partial } };
    get().setScene(scene);
  },

  addMarker: (marker) => {
    const markers = [...get().scene.markers, marker];
    const scene = { ...get().scene, markers };
    get().setScene(scene);
    set({ activeMarkerId: marker.id });
  },

  updateMarker: (id, partial) => {
    const markers = get().scene.markers.map((m) => (m.id === id ? { ...m, ...partial } : m));
    get().setScene({ ...get().scene, markers });
  },

  deleteMarker: (id) => {
    const markers = get().scene.markers.filter((m) => m.id !== id);
    const labels = get().scene.labels.filter((l) => !(l.targetType === 'marker' && l.targetId === id));
    get().setScene({ ...get().scene, markers, labels });
    if (get().activeMarkerId === id) set({ activeMarkerId: null });
  },

  addArc: (arc) => {
    const arcs = [...get().scene.arcs, arc];
    get().setScene({ ...get().scene, arcs });
    set({ activeArcId: arc.id });
  },

  updateArc: (id, partial) => {
    const arcs = get().scene.arcs.map((a) => (a.id === id ? { ...a, ...partial } : a));
    get().setScene({ ...get().scene, arcs });
  },

  deleteArc: (id) => {
    const arcs = get().scene.arcs.filter((a) => a.id !== id);
    const labels = get().scene.labels.filter((l) => !(l.targetType === 'arc' && l.targetId === id));
    get().setScene({ ...get().scene, arcs, labels });
    if (get().activeArcId === id) set({ activeArcId: null });
  },

  addLabel: (label) => {
    const labels = [...get().scene.labels, label];
    get().setScene({ ...get().scene, labels });
    set({ activeLabelId: label.id });
  },

  updateLabel: (id, partial) => {
    const labels = get().scene.labels.map((l) => (l.id === id ? { ...l, ...partial } : l));
    get().setScene({ ...get().scene, labels });
  },

  deleteLabel: (id) => {
    const labels = get().scene.labels.filter((l) => l.id !== id);
    get().setScene({ ...get().scene, labels });
    if (get().activeLabelId === id) set({ activeLabelId: null });
  },

  applyPreset: (presetId) => {
    const def = PRESETS[presetId];
    if (def) {
      get().setScene(def.config);
      set({ currentProjectName: def.name });
    }
  },

  undo: () => {
    const history = get().history;
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    set({
      scene: previous,
      history: newHistory,
      future: [get().scene, ...get().future],
      saveStatus: 'unsaved',
    });
  },

  redo: () => {
    const future = get().future;
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    set({
      scene: next,
      history: [...get().history, get().scene],
      future: newFuture,
      saveStatus: 'unsaved',
    });
  },

  setActiveLayer: (id) => set({ activeLayerId: id }),
  setActiveMarker: (id) => set({ activeMarkerId: id }),
  setActiveArc: (id) => set({ activeArcId: id }),
  setActiveLabel: (id) => set({ activeLabelId: id }),

  setStudioMode: (mode) => set({ studioMode: mode }),
  setDevicePreview: (device) => set({ devicePreview: device }),
  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  setExportModalOpen: (open) => set({ isExportModalOpen: open }),
  setProjectsDrawerOpen: (open) => set({ isProjectsDrawerOpen: open }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

  setProjectName: (name) => set({ currentProjectName: name, saveStatus: 'unsaved' }),

  saveCurrentProject: async () => {
    const { currentProjectId, currentProjectName, scene, currentUser } = get();
    if (!currentUser) {
      set({ isAuthModalOpen: true });
      return;
    }

    set({ saveStatus: 'saving', saveErrorMessage: null });
    const { data, error } = await saveCloudProject({
      id: currentProjectId || undefined,
      name: currentProjectName,
      scene_config: scene,
    });

    if (error) {
      set({ saveStatus: 'error', saveErrorMessage: error.message });
    } else if (data) {
      set({
        currentProjectId: data.id,
        currentProjectName: data.name,
        saveStatus: 'saved',
      });
      get().loadProjectsList();
    }
  },

  loadProject: (proj) => {
    set({
      currentProjectId: proj.id,
      currentProjectName: proj.name,
      scene: proj.scene_config,
      history: [],
      future: [],
      saveStatus: 'saved',
      isProjectsDrawerOpen: false,
    });
  },

  loadProjectsList: async () => {
    const projs = await fetchUserProjects();
    set({ userProjects: projs });
  },

  refreshAuth: async () => {
    const user = await getCurrentUser();
    set({ currentUser: user });
    if (user) {
      get().loadProjectsList();
    }
  },

  newBlankProject: () => {
    const fresh = createDefaultScene();
    set({
      scene: fresh,
      currentProjectId: null,
      currentProjectName: 'Untitled Globe',
      history: [],
      future: [],
      saveStatus: 'saved',
      isProjectsDrawerOpen: false,
    });
  },
}));
