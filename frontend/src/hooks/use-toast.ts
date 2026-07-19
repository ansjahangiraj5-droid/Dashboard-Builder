import * as React from "react";
import { useReducer } from "react";

type ToastVariant = "default" | "destructive";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  open?: boolean;
}

type Action =
  | { type: "ADD"; toast: Toast }
  | { type: "DISMISS"; id: string };

function reducer(state: Toast[], action: Action): Toast[] {
  if (action.type === "ADD") return [action.toast, ...state].slice(0, 5);
  if (action.type === "DISMISS") return state.filter((t) => t.id !== action.id);
  return state;
}

const listeners: Array<(toasts: Toast[]) => void> = [];
let memoryState: Toast[] = [];

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((l) => l(memoryState));
}

interface ToastInput {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

function toast(props: ToastInput) {
  const id = crypto.randomUUID();
  dispatch({ type: "ADD", toast: { ...props, id, open: true } });
  setTimeout(() => dispatch({ type: "DISMISS", id }), 5000);
}

function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>(memoryState);
  React.useEffect(() => {
    listeners.push(setToasts);
    return () => { const idx = listeners.indexOf(setToasts); if (idx > -1) listeners.splice(idx, 1); };
  }, []);
  return { toast, toasts, dismiss: (id: string) => dispatch({ type: "DISMISS", id }) };
}

export { useToast, toast };
