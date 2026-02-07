const KEY = "lessonlab_saved_worksheets_v1";

export function loadWorksheets() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWorksheets(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addWorksheet(item) {
  const items = loadWorksheets();
  items.unshift(item);
  saveWorksheets(items.slice(0, 50));
  return items.slice(0, 50);
}

export function removeWorksheet(id) {
  const items = loadWorksheets().filter(i => i.id !== id);
  saveWorksheets(items);
  return items;
}
