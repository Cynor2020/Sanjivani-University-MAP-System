/**
 * Helper functions for academic year calculations
 */

/**
 * Get the year field name based on student's join year and current academic year
 * @param {string} joinYear - The year when student first joined (e.g., "Third")
 * @param {string} joinAcademicYear - The academic year when student joined (e.g., "2023-24")
 * @param {string} currentAcademicYear - The current academic year (e.g., "2024-25")
 * @returns {string|null} - The year field name (e.g., "year3Points") or null if invalid
 */
export const getYearFieldName = (joinYear, joinAcademicYear, currentAcademicYear) => {
  // If we don't have the necessary data, return null
  if (!joinYear || !joinAcademicYear || !currentAcademicYear) {
    return null;
  }

  // Parse academic years to determine how many years have passed
  // This is a simplified approach - in a real system you might need more robust parsing
  const joinParts = joinAcademicYear.split('-');
  const currentParts = currentAcademicYear.split('-');
  
  // Calculate the difference in years
  let yearDifference = 0;
  if (joinParts.length === 2 && currentParts.length === 2) {
    const joinStartYear = parseInt(joinParts[0]);
    const currentStartYear = parseInt(currentParts[0]);
    yearDifference = currentStartYear - joinStartYear;
  }

  // Map join year to its order
  const yearOrderMap = {
    "First": 1,
    "Second": 2,
    "Third": 3,
    "Fourth": 4,
    "Fifth": 5,
    "Sixth": 6
  };

  // Get the order of the join year
  const joinYearOrder = yearOrderMap[joinYear];
  
  // If we can't determine the join year order, return null
  if (!joinYearOrder) {
    return null;
  }

  // Calculate the current year order
  const currentYearOrder = joinYearOrder + yearDifference;
  
  // Validate the current year order
  if (currentYearOrder < 1 || currentYearOrder > 6) {
    return null;
  }

  // Map to the corresponding year field
  const yearFieldMap = {
    1: "year1Points",
    2: "year2Points",
    3: "year3Points",
    4: "year4Points",
    5: "year5Points",
    6: "year6Points"
  };

  return yearFieldMap[currentYearOrder] || null;
};

/**
 * Get all relevant year field names from join year to current year
 * @param {string} joinYear - The year when student first joined (e.g., "Third")
 * @param {string} joinAcademicYear - The academic year when student joined (e.g., "2023-24")
 * @param {string} currentYear - The student's current year (e.g., "Fourth")
 * @param {string} currentAcademicYear - The current academic year (e.g., "2024-25")
 * @returns {Array} - Array of objects with year info { fieldName, displayName, order }
 */
export const getRelevantYearFields = (joinYear, joinAcademicYear, currentYear, currentAcademicYear) => {
  // If we don't have the necessary data, return empty array
  if (!joinYear || !joinAcademicYear || !currentYear || !currentAcademicYear) {
    return [];
  }

  // Map year names to their order
  const yearOrderMap = {
    "First": 1,
    "Second": 2,
    "Third": 3,
    "Fourth": 4,
    "Fifth": 5,
    "Sixth": 6
  };

  // Get the order of the join year and current year
  const joinYearOrder = yearOrderMap[joinYear];
  const currentYearOrder = yearOrderMap[currentYear];
  
  // If we can't determine the orders, return empty array
  if (!joinYearOrder || !currentYearOrder) {
    return [];
  }

  // Map order numbers to year field names and display names
  const yearInfoMap = {
    1: { fieldName: "year1Points", displayName: "First" },
    2: { fieldName: "year2Points", displayName: "Second" },
    3: { fieldName: "year3Points", displayName: "Third" },
    4: { fieldName: "year4Points", displayName: "Fourth" },
    5: { fieldName: "year5Points", displayName: "Fifth" },
    6: { fieldName: "year6Points", displayName: "Sixth" }
  };

  // Generate array of relevant years
  const relevantYears = [];
  for (let order = joinYearOrder; order <= currentYearOrder; order++) {
    if (yearInfoMap[order]) {
      relevantYears.push({
        fieldName: yearInfoMap[order].fieldName,
        displayName: yearInfoMap[order].displayName,
        order: order
      });
    }
  }

  return relevantYears;
};