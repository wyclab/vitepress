import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { useSSRContext } from "vue";
import { ssrRenderAttrs } from "vue/server-renderer";
//#region articles/zstn/index.md
var __pageData = JSON.parse("{\"title\":\"置身事内\",\"description\":\"置身事内 专题首页\",\"frontmatter\":{\"title\":\"置身事内\",\"description\":\"置身事内 专题首页\"},\"headers\":[],\"relativePath\":\"articles/zstn/index.md\",\"filePath\":\"articles/zstn/index.md\"}");
var _sfc_main = { name: "articles/zstn/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="置身事内" tabindex="-1">置身事内 <a class="header-anchor" href="#置身事内" aria-label="Permalink to “置身事内”">​</a></h1><p>欢迎来到「置身事内」专题。从这里进入各个栏目。</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("articles/zstn/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var zstn_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, zstn_default as default };
