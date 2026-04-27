export function calculatePriority(category, affectedCount) {
  const weights = {
    Medical: 50,
    Food: 40,
    Shelter: 30,
    Logistics: 20,
    Education: 10
  };
  
  const categoryScore = weights[category] || 10;
  const affectedScore = Math.min(affectedCount, 100);
  
  return categoryScore + affectedScore;
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}
