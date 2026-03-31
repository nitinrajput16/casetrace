const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { phone: '+911234567890' },
    update: {},
    create: { phone: '+911234567890', name: 'Test User' }
  });

  const now = new Date();

  await prisma.complaint.upsert({
    where: { complaintId: 'FIR-2026-DEL-001' },
    update: {},
    create: {
      complaintId: 'FIR-2026-DEL-001',
      userId: user.id,
      title: 'Unauthorized construction noise',
      description: 'Loud construction late night',
      status: 'ACTIVE',
      assignedOfficer: 'Inspector Raj',
      officerPhone: '+911112223334',
      policeStation: 'Delhi Central',
      district: 'Delhi',
      filedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      lastUpdateAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      updates: {
        create: [
          { updateText: 'FIR registered', updatedBy: 'Citizen', createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) },
          { updateText: 'IO assigned', updatedBy: 'Police', createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) }
        ]
      }
    }
  });

  await prisma.complaint.upsert({
    where: { complaintId: 'FIR-2026-MUM-002' },
    update: {},
    create: {
      complaintId: 'FIR-2026-MUM-002',
      userId: user.id,
      title: 'Vehicle theft',
      description: 'Stolen two-wheeler',
      status: 'NEGLECTED',
      assignedOfficer: 'Inspector Mehta',
      officerPhone: '+919998887776',
      policeStation: 'Mumbai West',
      district: 'Mumbai',
      filedAt: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000),
      lastUpdateAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      updates: { create: [{ updateText: 'FIR registered', updatedBy: 'Citizen', createdAt: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000) }] }
    }
  });

  await prisma.complaint.upsert({
    where: { complaintId: 'FIR-2026-BLR-003' },
    update: {},
    create: {
      complaintId: 'FIR-2026-BLR-003',
      userId: user.id,
      title: 'Domestic dispute - resolved',
      description: 'Family dispute resolved',
      status: 'RESOLVED',
      assignedOfficer: 'Inspector Kumar',
      officerPhone: '+919977665544',
      policeStation: 'Bengaluru Central',
      district: 'Bengaluru',
      filedAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
      lastUpdateAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      updates: { create: [{ updateText: 'Case closed', updatedBy: 'Police', createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) }] }
    }
  });
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
