import { PrismaClient, CollegeTier } from '@prisma/client';

const prisma = new PrismaClient();

const colleges = [
  // TOP_50 — Priority launch
  { name: 'Princeton University', state: 'NJ', emailDomain: 'princeton.edu', tier: CollegeTier.TOP_50 },
  { name: 'Harvard University', state: 'MA', emailDomain: 'harvard.edu', tier: CollegeTier.TOP_50 },
  { name: 'Yale University', state: 'CT', emailDomain: 'yale.edu', tier: CollegeTier.TOP_50 },
  { name: 'Stanford University', state: 'CA', emailDomain: 'stanford.edu', tier: CollegeTier.TOP_50 },
  { name: 'Massachusetts Institute of Technology', state: 'MA', emailDomain: 'mit.edu', tier: CollegeTier.TOP_50 },
  { name: 'University of Pennsylvania', state: 'PA', emailDomain: 'upenn.edu', tier: CollegeTier.TOP_50 },
  { name: 'California Institute of Technology', state: 'CA', emailDomain: 'caltech.edu', tier: CollegeTier.TOP_50 },
  { name: 'Northwestern University', state: 'IL', emailDomain: 'northwestern.edu', tier: CollegeTier.TOP_50 },
  { name: 'Duke University', state: 'NC', emailDomain: 'duke.edu', tier: CollegeTier.TOP_50 },
  { name: 'University of Chicago', state: 'IL', emailDomain: 'uchicago.edu', tier: CollegeTier.TOP_50 },
  { name: 'Johns Hopkins University', state: 'MD', emailDomain: 'jhu.edu', tier: CollegeTier.TOP_50 },
  { name: 'Columbia University', state: 'NY', emailDomain: 'columbia.edu', tier: CollegeTier.TOP_50 },
  { name: 'Carnegie Mellon University', state: 'PA', emailDomain: 'cmu.edu', tier: CollegeTier.TOP_50 },
  { name: 'Rice University', state: 'TX', emailDomain: 'rice.edu', tier: CollegeTier.TOP_50 },
  { name: 'Dartmouth College', state: 'NH', emailDomain: 'dartmouth.edu', tier: CollegeTier.TOP_50 },
  { name: 'Vanderbilt University', state: 'TN', emailDomain: 'vanderbilt.edu', tier: CollegeTier.TOP_50 },
  { name: 'Cornell University', state: 'NY', emailDomain: 'cornell.edu', tier: CollegeTier.TOP_50 },
  { name: 'Brown University', state: 'RI', emailDomain: 'brown.edu', tier: CollegeTier.TOP_50 },
  { name: 'University of Notre Dame', state: 'IN', emailDomain: 'nd.edu', tier: CollegeTier.TOP_50 },
  { name: 'University of California, Los Angeles', state: 'CA', emailDomain: 'ucla.edu', tier: CollegeTier.TOP_50 },
  // TOP_100 — Week 3+ expansion
  { name: 'University of Southern California', state: 'CA', emailDomain: 'usc.edu', tier: CollegeTier.TOP_100 },
  { name: 'University of California, Berkeley', state: 'CA', emailDomain: 'berkeley.edu', tier: CollegeTier.TOP_100 },
  { name: 'University of Michigan', state: 'MI', emailDomain: 'umich.edu', tier: CollegeTier.TOP_100 },
  { name: 'New York University', state: 'NY', emailDomain: 'nyu.edu', tier: CollegeTier.TOP_100 },
  { name: 'Georgia Institute of Technology', state: 'GA', emailDomain: 'gatech.edu', tier: CollegeTier.TOP_100 },
  { name: 'University of Texas at Austin', state: 'TX', emailDomain: 'utexas.edu', tier: CollegeTier.TOP_100 },
  { name: 'University of Illinois Urbana-Champaign', state: 'IL', emailDomain: 'illinois.edu', tier: CollegeTier.TOP_100 },
  { name: 'Case Western Reserve University', state: 'OH', emailDomain: 'case.edu', tier: CollegeTier.TOP_100 },
  { name: 'Emory University', state: 'GA', emailDomain: 'emory.edu', tier: CollegeTier.TOP_100 },
  { name: 'Boston College', state: 'MA', emailDomain: 'bc.edu', tier: CollegeTier.TOP_100 },
  { name: 'Wake Forest University', state: 'NC', emailDomain: 'wfu.edu', tier: CollegeTier.TOP_100 },
  { name: 'Tufts University', state: 'MA', emailDomain: 'tufts.edu', tier: CollegeTier.TOP_100 },
  { name: 'Boston University', state: 'MA', emailDomain: 'bu.edu', tier: CollegeTier.TOP_100 },
  { name: 'University of Rochester', state: 'NY', emailDomain: 'rochester.edu', tier: CollegeTier.TOP_100 },
  { name: 'Tulane University', state: 'LA', emailDomain: 'tulane.edu', tier: CollegeTier.TOP_100 },
  { name: 'Northeastern University', state: 'MA', emailDomain: 'northeastern.edu', tier: CollegeTier.TOP_100 },
  { name: 'University of Wisconsin-Madison', state: 'WI', emailDomain: 'wisc.edu', tier: CollegeTier.TOP_100 },
  { name: 'University of Washington', state: 'WA', emailDomain: 'uw.edu', tier: CollegeTier.TOP_100 },
  { name: 'Purdue University', state: 'IN', emailDomain: 'purdue.edu', tier: CollegeTier.TOP_100 },
  { name: 'University of Florida', state: 'FL', emailDomain: 'ufl.edu', tier: CollegeTier.TOP_100 },
];

async function main() {
  console.log('Seeding colleges...');

  for (const college of colleges) {
    await prisma.college.upsert({
      where: { name: college.name },
      update: {},
      create: { ...college, country: 'USA' },
    });
  }

  console.log(`✅ Seeded ${colleges.length} colleges.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
