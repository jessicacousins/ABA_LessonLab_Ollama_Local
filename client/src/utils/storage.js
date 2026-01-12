const KEY = "lessonlab_saved_plans_v1";

export function loadPlans() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePlans(plans) {
  localStorage.setItem(KEY, JSON.stringify(plans));
}

export function addPlan(plan) {
  const plans = loadPlans();
  plans.unshift(plan);
  savePlans(plans.slice(0, 50));
  return plans.slice(0, 50);
}

export function removePlan(id) {
  const plans = loadPlans().filter(p => p.id !== id);
  savePlans(plans);
  return plans;
}
