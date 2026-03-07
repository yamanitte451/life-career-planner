'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LifePlan } from '../lib/types';
import { loadPlan, savePlan, defaultLifePlan } from '../lib/storage';

interface PlanContextType {
  plan: LifePlan;
  updatePlan: (updates: Partial<LifePlan>) => void;
  resetPlan: () => void;
}

const PlanContext = createContext<PlanContextType>({
  plan: defaultLifePlan,
  updatePlan: () => {},
  resetPlan: () => {},
});

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<LifePlan>(defaultLifePlan);

  useEffect(() => {
    setPlan(loadPlan());
  }, []);

  const updatePlan = (updates: Partial<LifePlan>) => {
    setPlan((prev) => {
      const next = { ...prev, ...updates };
      savePlan(next);
      return next;
    });
  };

  const resetPlan = () => {
    setPlan(defaultLifePlan);
    savePlan(defaultLifePlan);
  };

  return (
    <PlanContext.Provider value={{ plan, updatePlan, resetPlan }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}
