import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { PlanProvider } from '../context/PlanContext';

function AllProviders({ children }: { children: React.ReactNode }) {
  return <PlanProvider>{children}</PlanProvider>;
}

export function renderWithPlan(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export function setupLocalStorageMock() {
  const store: Record<string, string> = {};
  const mock = {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
  Object.defineProperty(window, 'localStorage', { value: mock, writable: true });
  return mock;
}

export { render } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
