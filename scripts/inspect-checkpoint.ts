import * as fs from 'fs';
import * as path from 'path';

const checkpoint = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'prisma', 'pre-remediation-checkpoint.json'), 'utf-8')
);

console.log(`Loaded checkpoint: ${checkpoint.metadata.totalProjects} projects`);
checkpoint.projects.forEach((p: any, idx: number) => {
  console.log(`${idx + 1}. [${p.id}] "${p.name}" | Locality: ${p.locality?.name} (${p.localityId}) | RERA: ${p.reraNumber || 'NONE'} | Units: ${p.totalUnits} | Towers: ${p.totalTowers} | Badge: ${p.verificationBadge} | Type: ${p.projectType}`);
});
