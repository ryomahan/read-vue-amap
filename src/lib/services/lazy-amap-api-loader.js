import { patchIOS11Geo } from '../utils/polyfill';

// 默认参数
const DEFAULT_AMP_CONFIG = {
  key: null,
  v: '1.4.4',
  protocol: 'https',
  hostAndPath: 'webapi.amap.com/maps',
  plugin: [],
  callback: 'amapInitComponent'
};

export default class AMapAPILoader {
  /**
   * @param config required 初始化参数
   */
  constructor(config) {
    // TODO route 4
    this._config = {
      ...DEFAULT_AMP_CONFIG,
      ...config
    };
    this._document = document;  // 备份 document
    this._window = window;      // 备份 window
    this._scriptLoaded = false; // 脚本加载标识
    this._queueEvents = [ patchIOS11Geo];
  }

  load() {
    // TODO route 5
    if (this._window.AMap && this._window.AMap.Map) {
      // TODO 存疑-这里做这一步的目的是什么？
      // 如果已经注入了 AMap 类并且实例化了 Map 类返回加载地图 ui script 的异步加载函数
      return this.loadUIAMap();
    }
    // 如果 script loading promise 已经定义好，直接返回
    if (this._scriptLoadingPromise) return this._scriptLoadingPromise;
    // 定义地图导入 script
    const script = this._document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    // 通过内部函数获取 script src 属性 | 这里只是获取了属性但是没有加载
    script.src = this._getScriptSrc();

    // 如果定义了 ui 版本，返回加载地图 ui script 的异步加载函数
    const UIPromise = this._config.uiVersion ? this.loadUIAMap() : null;

    // 创建 script 异步加载函数
    this._scriptLoadingPromise = new Promise((resolve, reject) => {
      // 给 window 注入一个 amapInitComponent 方法 | 这个方法是 script 的回调函数
      this._window['amapInitComponent'] = () => {
        // 如果定义了事件列表，逐个执行它们
        while (this._queueEvents.length) {
          this._queueEvents.pop().apply();
        }
        // 如果存在加载地图 ui script 的异步加载函数
        if (UIPromise) {
          // 执行地图 ui script 的异步加载函数
          UIPromise.then(() => {
            // 进行 ui 初始化
            window.initAMapUI();
            setTimeout(resolve);
          });
        } else {
          return resolve();
        }
      };
      // 如果导入失败
      script.onerror = error => reject(error);
    });
    // 在 document head 中导入 script 标签（引入 webapi.amap.com
    this._document.head.appendChild(script);
    return this._scriptLoadingPromise;
  }

  loadUIAMap() {
    // TODO route 6 | 7
    // 如果没有设置 ui 版本或者已经加载了 AMapUI 实例直接跳过
    if (!this._config.uiVersion || window.AMapUI) return Promise.resolve();
    return new Promise((resolve, reject) => {
      // 创建 UI script 引入脚本
      const UIScript = document.createElement('script');
      // 获取设置的 UI 版本号
      const [versionMain, versionSub, versionDetail] = this._config.uiVersion.split('.');
      if (versionMain === undefined || versionSub === undefined) {
        console.error('amap ui version is not correct, please check! version: ', this._config.uiVersion);
        return;
      }
      // 拼接 script | 异步引入
      let src = `${this._config.protocol}://webapi.amap.com/ui/${versionMain}.${versionSub}/main-async.js`;
      if (versionDetail) src += `?v=${versionMain}.${versionSub}.${versionDetail}`;
      UIScript.src = src;
      UIScript.type = 'text/javascript';
      UIScript.async = true;
      this._document.head.appendChild(UIScript);
      // 当 UI script 加载完毕后，执行回调
      UIScript.onload = () => {
        setTimeout(resolve, 0);
      };
      // 当 UI script 加载出现错误时，执行错误回调
      UIScript.onerror = () => reject();
    });
  }

  _getScriptSrc() {
    // TODO route 6
    // amap plugin prefix reg
    const amap_prefix_reg = /^AMap./;

    const config = this._config;
    const paramKeys = ['v', 'key', 'plugin', 'callback'];

    // 处理插件名字
    if (config.plugin && config.plugin.length > 0) {
      // 如果有插件加载
      // 添加默认插件
      config.plugin.push('Autocomplete', 'PlaceSearch', 'PolyEditor', 'CircleEditor');

      const plugins = [];

      // fixed plugin name compatibility.
      config.plugin.forEach(item => {
        // 自动补全插件头
        const prefixName = (amap_prefix_reg.test(item)) ? item : 'AMap.' + item;
        // 自动删除插件头
        // TODO 存疑-这里把删除插件头的内容也添加进去的目的是什么
        const pureName = prefixName.replace(amap_prefix_reg, '');

        plugins.push(prefixName, pureName);
      });

      config.plugin = plugins;
    }

    const params = Object.keys(config)
                         .filter(k => ~paramKeys.indexOf(k))
                         .filter(k => config[k] != null)
                         .filter(k => {
                           return !Array.isArray(config[k]) ||
                                (Array.isArray(config[k]) && config[k].length > 0);
                         })
                         .map(k => {
                           let v = config[k];
                           if (Array.isArray(v)) return { key: k, value: v.join(',')};
                           return {key: k, value: v};
                         })
                         .map(entry => `${entry.key}=${entry.value}`)
                         .join('&');
    return `${this._config.protocol}://${this._config.hostAndPath}?${params}`;
  }
}
