import { create } from "zustand";
import type { FramePlacement } from "@sprite-generator/shared-types";

interface SheetEditorState {
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  margin: number;
  padding: number;
  placements: FramePlacement[];

  setColumns: (v: number) => void;
  setRows: (v: number) => void;
  setCellWidth: (v: number) => void;
  setCellHeight: (v: number) => void;
  setMargin: (v: number) => void;
  setPadding: (v: number) => void;

  placeAsset: (assetId: string, row: number, col: number) => void;
  removeAsset: (assetId: string) => void;
  clearCell: (row: number, col: number) => void;
  reorder: (placements: FramePlacement[]) => void;
}

export const useSheetEditorStore = create<SheetEditorState>((set) => ({
  columns: 4,
  rows: 2,
  cellWidth: 32,
  cellHeight: 32,
  margin: 0,
  padding: 0,
  placements: [],

  setColumns: (columns) => set({ columns }),
  setRows: (rows) => set({ rows }),
  setCellWidth: (cellWidth) => set({ cellWidth }),
  setCellHeight: (cellHeight) => set({ cellHeight }),
  setMargin: (margin) => set({ margin }),
  setPadding: (padding) => set({ padding }),

  placeAsset: (assetId, row, col) =>
    set((state) => ({
      placements: [
        ...state.placements.filter((p) => !(p.row === row && p.col === col)),
        { assetId, row, col },
      ],
    })),

  removeAsset: (assetId) =>
    set((state) => ({
      placements: state.placements.filter((p) => p.assetId !== assetId),
    })),

  clearCell: (row, col) =>
    set((state) => ({
      placements: state.placements.filter((p) => !(p.row === row && p.col === col)),
    })),

  reorder: (placements) => set({ placements }),
}));
