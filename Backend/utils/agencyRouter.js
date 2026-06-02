const Agency = require('../models/Agency');

/**
 * Automatically assigns an incoming report to the most appropriate agency.
 *
 * Priority order:
 *  1. Verified agency that covers the exact LGA AND handles the report category
 *  2. Any verified agency covering the LGA (category fallback)
 *  3. Any verified agency in the state (last resort)
 *
 * Returns the Agency document or null if no agency is available.
 */
const assignAgency = async (lga, state = 'Lagos', category) => {
  try {
    // 1. Best match — LGA + category
    if (lga && category) {
      const agency = await Agency.findOne({
        verified: true,
        assignedAreas: { $in: [lga] },
        categories: { $in: [category] },
      });
      if (agency) {
        console.log(`✅ Agency assigned (LGA + category match): ${agency.organizationName}`);
        return agency;
      }
    }

    // 2. LGA match only
    if (lga) {
      const agency = await Agency.findOne({
        verified: true,
        assignedAreas: { $in: [lga] },
      });
      if (agency) {
        console.log(`✅ Agency assigned (LGA match): ${agency.organizationName}`);
        return agency;
      }
    }

    // 3. State-level fallback
    const agency = await Agency.findOne({ verified: true, state });
    if (agency) {
      console.log(`✅ Agency assigned (state fallback): ${agency.organizationName}`);
      return agency;
    }

    console.log('⚠️  No agency found — report will remain unassigned.');
    return null;
  } catch (error) {
    console.error('Agency assignment error:', error.message);
    return null;
  }
};

module.exports = { assignAgency };