const store = new Map<string, string>();

const AsyncStorage = {
  getItem: jest.fn(async (key: string): Promise<string | null> => store.get(key) ?? null),
  setItem: jest.fn(async (key: string, value: string): Promise<void> => {
    store.set(key, value);
  }),
  removeItem: jest.fn(async (key: string): Promise<void> => {
    store.delete(key);
  }),
  clear: jest.fn(async (): Promise<void> => {
    store.clear();
  }),
  getAllKeys: jest.fn(async (): Promise<string[]> => [...store.keys()]),
  multiRemove: jest.fn(async (keys: string[]): Promise<void> => {
    keys.forEach((k) => store.delete(k));
  }),
  __store: store,
};

export default AsyncStorage;
