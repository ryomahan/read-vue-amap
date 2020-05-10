// polyfills | JS 兼容脚本
import './polyfills';

// 将任何其他格式转换为大驼峰格式例如：foo-bar => FooBar | --foo.bar => FooBar
import upperCamelCase from 'uppercamelcase';

// 初始化接口
import {initAMapApiLoader} from './services/injected-amap-api-instance';

// 组件导入
import AMap from './components/amap.vue';
import AMapMarker from './components/amap-marker.vue';
import AMapSearchBox from './components/amap-search-box.vue';
import AMapCircle from './components/amap-circle.vue';
import AMapGroupImage from './components/amap-ground-image.vue';
import AMapInfoWindow from './components/amap-info-window.vue';
import AMapPolyline from './components/amap-polyline.vue';
import AMapPolygon from './components/amap-polygon.vue';
import AMapText from './components/amap-text.vue';
import AMapBezierCurve from './components/amap-bezier-curve.vue';
import AMapCircleMarker from './components/amap-circle-marker.vue';
import AMapEllipse from './components/amap-ellipse.vue';
import AMapRectangle from './components/amap-rectangle.vue';

// managers
import AMapManager from './managers/amap-manager';
import createCustomComponent from './adapter/custom-adapter';

let components = [
  AMap,
  AMapMarker,
  AMapSearchBox,
  AMapCircle,
  AMapGroupImage,
  AMapInfoWindow,
  AMapPolygon,
  AMapPolyline,
  AMapText,
  AMapBezierCurve,
  AMapCircleMarker,
  AMapEllipse,
  AMapRectangle
];

let VueAMap = {
  initAMapApiLoader,
  AMapManager
};

// TODO route 2
VueAMap.install = (Vue) => {
  if (VueAMap.installed) return;
  // optionMergeStrategies 自定义合并策略的选项
  // TODO 存疑-调用 vue.deferredReady = 调用 vue.created 是这个意思吗
  Vue.config.optionMergeStrategies.deferredReady = Vue.config.optionMergeStrategies.created;
  components.map(_component => {
    // register component
    Vue.component(_component.name, _component);

    // component cache
    // TODO 存疑-这一步的作用是什么？
    // VueAMap["Amap"] = AMap
    VueAMap[upperCamelCase(_component.name).replace(/^El/, '')] = _component;
  });
};

// 为啥还要再定义一个 install 方法 | 难道说 Vue.use() 之后调用的是这个方法？
// 阅读了 vue-router 和 vuex 初始化部分的源码之后发现确实是调用这一个 install 函数
// TODO route 1
const install = function(Vue, opts = {}) {
  /* istanbul ignore if */
  if (install.installed) return;
  VueAMap.install(Vue);
};

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default VueAMap;

export {
  AMapManager, // 用来在创建地图实例之后对其进行管理
  initAMapApiLoader, // 用来初始化
  createCustomComponent
};
export { lazyAMapApiLoaderInstance } from './services/injected-amap-api-instance';
