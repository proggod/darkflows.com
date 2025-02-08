// No 'use server' directive here
export const isBuildTime = () => {
  return process.env.NEXT_PHASE === 'build' || 
         process.env.NEXT_PHASE === 'static' || 
         process.env.NEXT_PHASE === 'experimental-compile' ||
         process.env.SKIP_DB_CONNECT === 'true';
};

export const shouldSkipOperation = () => {
  return isBuildTime() || process.env.NODE_ENV === 'test';
};

export const getMockData = <T>(mockData: T): T => {
  if (shouldSkipOperation()) {
    return mockData;
  }
  return null as T;
}; 