// Function to check if a navigation item is active
// fallow-ignore-file
const isActive = (href: string, path: string): boolean => {
  // Exact match for root paths
  if (href === "/") {
    return path === "/";
  }

  // For other paths, check if current path starts with the href
  // This handles nested routes like /clients/[id] matching /clients
  return path.startsWith(href);
};

export { isActive };
