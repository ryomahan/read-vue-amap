let lazyAMapApiLoaderInstance = null;
import AMapAPILoader from './lazy-amap-api-loader';
import Vue from 'vue';

// AMap Api 初始化
// TODO route 3
export const initAMapApiLoader = (config) => {
  // TODO 存疑-这句话的意思是否是：如果开启了服务器渲染？
  if (Vue.prototype.$isServer) return;
  // if (lazyAMapApiLoaderInstance) throw new Error('You has already initial your lazyAMapApiLoaderInstance, just import it');
  if (lazyAMapApiLoaderInstance) return;
  if (!lazyAMapApiLoaderInstance) lazyAMapApiLoaderInstance = new AMapAPILoader(config);
  lazyAMapApiLoaderInstance.load();
  // TODO route 8 | end 到此整个插件的导入结束
};

export { lazyAMapApiLoaderInstance };
