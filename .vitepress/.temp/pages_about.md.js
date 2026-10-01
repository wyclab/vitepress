import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { useSSRContext } from "vue";
import { ssrRenderAttrs } from "vue/server-renderer";
//#region pages/about.md
var __pageData = JSON.parse("{\"title\":\"关于\",\"description\":\"\",\"frontmatter\":{\"title\":\"关于\"},\"headers\":[],\"relativePath\":\"pages/about.md\",\"filePath\":\"pages/about.md\"}");
var _sfc_main = { name: "pages/about.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h2 id="无用处实验室-👋" tabindex="-1">无用处实验室 👋 <a class="header-anchor" href="#无用处实验室-👋" aria-label="Permalink to “无用处实验室 👋”">​</a></h2><p>施工中。。。</p><h2 id="联系我" tabindex="-1">联系我 <a class="header-anchor" href="#联系我" aria-label="Permalink to “联系我”">​</a></h2><ul><li>GitHub：<a href="https://github.com/wyclab" target="_blank" rel="noreferrer">@wyclab</a></li><li>RSS：<a href="/feed.xml">订阅本站</a></li><li>E-mail: <a href="mailto:admin@wyclab.com" target="_blank" rel="noreferrer">admin@wyclab.com</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/about.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var about_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, about_default as default };
