'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LifePlan } from '../lib/types';
import { loadPlan, savePlan, defaultLifePlan } from '../lib/storage';

type PlanUpdater = Partial<LifePlan> | ((prev: LifePlan) => Partial<LifePlan>);

interface PlanContextType {
  plan: LifePlan;
  updatePlan: (updates: PlanUpdater) => void;
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

  const updatePlan = (updates: PlanUpdater) => {
    setPlan((prev) => {
      const partial = typeof updates === 'function' ? updates(prev) : updates;
      const next = { ...prev, ...partial };
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
