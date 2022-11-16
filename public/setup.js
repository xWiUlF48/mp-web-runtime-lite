(() => {
  const win = window;

  const factoryMap = new Map();
  const instanceMap = new Map();

  function define(name, factory) {
    const normalized = new URL(name, 'https://example.com/').pathname;
    factoryMap.set(normalized.replace(/(\.js)?$/, '.js'), factory);
  }

  function createRequire(base) {
    const baseURL = new URL(base, 'https://example.com/');
    return (request) => {
      const target = new URL(request, baseURL).pathname;
      if (!instanceMap.has(target)) {
        instantiateModule(target);
      }
      return instanceMap.get(target);
    };
  }

  function instantiateModule(target) {
    const factory = factoryMap.get(target.replace(/(\.js)?$/, '.js'));
    const module = { exports: {} };
    const require = createRequire(target);
    factory(require, module, module.exports);
    instanceMap.set(target, module.exports);
  }

  win.define = define;
  win.use = createRequire('');
  win.factoryMap = factoryMap;
  win.require = () => {};
})();
