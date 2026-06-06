function createCaseId() {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
  return `CASE-${timestamp}-${randomSuffix}`;
}

module.exports = { createCaseId };
