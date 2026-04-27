import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const tasks = await db.getTasks();
    const volunteers = await db.getVolunteers();
    
    const task = tasks.find(t => t.id === id);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    
    let availableVolunteers = volunteers.filter(v => v.isAvailable);
    
    const scoredVolunteers = availableVolunteers.map(v => {
      let score = 0;
      let reasons = [];
      
      const taskCategory = task.category ? task.category.toLowerCase() : '';
      const vSkill = v.skill ? v.skill.toLowerCase() : '';
      
      if (vSkill === taskCategory && taskCategory) {
        score += 50; // HIGH score
        reasons.push("Primary Skill Match");
      } else {
        const secondarySkills = v.secondarySkills || [];
        const hasSecondaryMatch = secondarySkills.some(s => s?.toLowerCase() === taskCategory);
        if (hasSecondaryMatch && taskCategory !== '') {
          score += 25; // MEDIUM score
          reasons.push("Secondary Skill Match");
        }
      }
      
      return { ...v, matchScore: score, matchReasons: reasons };
    });
    
    scoredVolunteers.sort((a, b) => b.matchScore - a.matchScore);
    
    return NextResponse.json(scoredVolunteers.slice(0, 5));
  } catch(err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
