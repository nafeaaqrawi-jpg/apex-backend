import { db } from '../lib/db';
import { colleges } from './schema';

const collegeData = [
  // TOP_50 — Ivy League + peer institutions
  { name: 'Harvard University', state: 'MA', emailDomain: 'harvard.edu', tier: 'TOP_50' as const },
  { name: 'Massachusetts Institute of Technology', state: 'MA', emailDomain: 'mit.edu', tier: 'TOP_50' as const },
  { name: 'Stanford University', state: 'CA', emailDomain: 'stanford.edu', tier: 'TOP_50' as const },
  { name: 'Yale University', state: 'CT', emailDomain: 'yale.edu', tier: 'TOP_50' as const },
  { name: 'Princeton University', state: 'NJ', emailDomain: 'princeton.edu', tier: 'TOP_50' as const },
  { name: 'Columbia University', state: 'NY', emailDomain: 'columbia.edu', tier: 'TOP_50' as const },
  { name: 'University of Pennsylvania', state: 'PA', emailDomain: 'upenn.edu', tier: 'TOP_50' as const },
  { name: 'Duke University', state: 'NC', emailDomain: 'duke.edu', tier: 'TOP_50' as const },
  { name: 'Northwestern University', state: 'IL', emailDomain: 'northwestern.edu', tier: 'TOP_50' as const },
  { name: 'Dartmouth College', state: 'NH', emailDomain: 'dartmouth.edu', tier: 'TOP_50' as const },
  { name: 'Brown University', state: 'RI', emailDomain: 'brown.edu', tier: 'TOP_50' as const },
  { name: 'Cornell University', state: 'NY', emailDomain: 'cornell.edu', tier: 'TOP_50' as const },
  { name: 'Vanderbilt University', state: 'TN', emailDomain: 'vanderbilt.edu', tier: 'TOP_50' as const },
  { name: 'Rice University', state: 'TX', emailDomain: 'rice.edu', tier: 'TOP_50' as const },
  { name: 'Washington University in St. Louis', state: 'MO', emailDomain: 'wustl.edu', tier: 'TOP_50' as const },
  { name: 'University of Notre Dame', state: 'IN', emailDomain: 'nd.edu', tier: 'TOP_50' as const },
  { name: 'Georgetown University', state: 'DC', emailDomain: 'georgetown.edu', tier: 'TOP_50' as const },
  { name: 'Emory University', state: 'GA', emailDomain: 'emory.edu', tier: 'TOP_50' as const },
  { name: 'Carnegie Mellon University', state: 'PA', emailDomain: 'cmu.edu', tier: 'TOP_50' as const },
  { name: 'University of California, Berkeley', state: 'CA', emailDomain: 'berkeley.edu', tier: 'TOP_50' as const },
  { name: 'University of California, Los Angeles', state: 'CA', emailDomain: 'ucla.edu', tier: 'TOP_50' as const },
  { name: 'University of Michigan', state: 'MI', emailDomain: 'umich.edu', tier: 'TOP_50' as const },
  { name: 'University of Virginia', state: 'VA', emailDomain: 'virginia.edu', tier: 'TOP_50' as const },
  { name: 'University of North Carolina at Chapel Hill', state: 'NC', emailDomain: 'unc.edu', tier: 'TOP_50' as const },
  { name: 'University of Chicago', state: 'IL', emailDomain: 'uchicago.edu', tier: 'TOP_50' as const },
  // TOP_100 — Strong national universities
  { name: 'University of Southern California', state: 'CA', emailDomain: 'usc.edu', tier: 'TOP_100' as const },
  { name: 'New York University', state: 'NY', emailDomain: 'nyu.edu', tier: 'TOP_100' as const },
  { name: 'Boston University', state: 'MA', emailDomain: 'bu.edu', tier: 'TOP_100' as const },
  { name: 'Tufts University', state: 'MA', emailDomain: 'tufts.edu', tier: 'TOP_100' as const },
  { name: 'Boston College', state: 'MA', emailDomain: 'bc.edu', tier: 'TOP_100' as const },
  { name: 'Tulane University', state: 'LA', emailDomain: 'tulane.edu', tier: 'TOP_100' as const },
  { name: 'University of Texas at Austin', state: 'TX', emailDomain: 'utexas.edu', tier: 'TOP_100' as const },
  { name: 'University of Florida', state: 'FL', emailDomain: 'ufl.edu', tier: 'TOP_100' as const },
  { name: 'Purdue University', state: 'IN', emailDomain: 'purdue.edu', tier: 'TOP_100' as const },
  { name: 'Penn State University', state: 'PA', emailDomain: 'psu.edu', tier: 'TOP_100' as const },
  { name: 'Ohio State University', state: 'OH', emailDomain: 'osu.edu', tier: 'TOP_100' as const },
  { name: 'University of Wisconsin-Madison', state: 'WI', emailDomain: 'wisc.edu', tier: 'TOP_100' as const },
  { name: 'University of Washington', state: 'WA', emailDomain: 'uw.edu', tier: 'TOP_100' as const },
  { name: 'Northeastern University', state: 'MA', emailDomain: 'northeastern.edu', tier: 'TOP_100' as const },
  { name: 'George Washington University', state: 'DC', emailDomain: 'gwu.edu', tier: 'TOP_100' as const },
  // Additional strong institutions
  { name: 'Johns Hopkins University', state: 'MD', emailDomain: 'jhu.edu', tier: 'TOP_50' as const },
  { name: 'California Institute of Technology', state: 'CA', emailDomain: 'caltech.edu', tier: 'TOP_50' as const },
  { name: 'Georgia Institute of Technology', state: 'GA', emailDomain: 'gatech.edu', tier: 'TOP_100' as const },
  { name: 'University of Illinois Urbana-Champaign', state: 'IL', emailDomain: 'illinois.edu', tier: 'TOP_100' as const },
  { name: 'Wake Forest University', state: 'NC', emailDomain: 'wfu.edu', tier: 'TOP_100' as const },
  { name: 'Case Western Reserve University', state: 'OH', emailDomain: 'case.edu', tier: 'TOP_100' as const },
  { name: 'University of Rochester', state: 'NY', emailDomain: 'rochester.edu', tier: 'TOP_100' as const },
];

async function main() {
  console.log('Seeding colleges...');

  await db
    .insert(colleges)
    .values(collegeData.map((c) => ({ ...c, country: 'USA' })))
    .onConflictDoNothing();

  console.log(`Seeded ${collegeData.length} colleges (skipped any duplicates).`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
