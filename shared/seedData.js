export function createSeedEntries(definitions, ids, createMeta = () => ({})) {
  return Object.freeze(
    Object.entries(definitions).map(([key, definition]) => ({
      id: ids[key],
      name: definition.name,
      ...createMeta(definition, key),
    })),
  );
}
